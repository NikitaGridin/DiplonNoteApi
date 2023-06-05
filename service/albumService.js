const { Sequelize } = require("@sequelize/core");
const { sequelize } = require("../db");
const {
  Album,
  Track,
  User,
  Genre,
  Coauthor,
  AlbumGenre,
} = require("../models/association");
const fs = require("fs");

class albumService {
  async all(part = 1) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const albums = await Album.findAll({
      attributes: [
        "id",
        "title",
        "img",
        "type",
        "status",
        "UserId",
        [
          sequelize.literal(
            `(SELECT COUNT(DISTINCT Auditions.UserId)
            FROM Auditions
            JOIN Tracks ON Auditions.TrackId = Tracks.id
            WHERE Tracks.AlbumId = Album.id
            GROUP BY Auditions.UserId)`
          ),
          "auditions",
        ],
      ],
      where: { status: 2 },
      include: [
        {
          model: Genre,
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
      limit: limit,
      offset: offset,
      order: [[sequelize.literal("auditions"), "DESC"]],
    });

    if (!albums.length) {
      return {
        error: "Альбомы кончились!",
      };
    }
    return albums;
  }

  async one(id) {
    const album = await Album.findByPk(id, {
      attributes: [
        "id",
        "title",
        "img",
        "type",
        [
          sequelize.literal(
            `(SELECT COUNT(DISTINCT Auditions.UserId)
            FROM Auditions
            JOIN Tracks ON Auditions.TrackId = Tracks.id
            WHERE Tracks.AlbumId = Album.id
            GROUP BY Auditions.UserId)`
          ),
          "auditions",
        ],
      ],
      include: [
        {
          model: Track,
          attributes: ["id", "title", "audio"],
          include: {
            model: Coauthor,
            as: "CoauthorAlias",
            attributes: ["id"],
            include: {
              model: User,
              attributes: ["id", "nickname"],
            },
          },
        },
        {
          model: Genre,
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
          where: { id: sequelize.col("Album.UserId") },
        },
      ],
    });

    return album;
  }

  async add(body, files) {
    const { userId, albumName, genre, type } = body;
    const tracks = [];
    const img = files[0];
    const audioFiles = files.filter((file) =>
      file.fieldname.startsWith("audio")
    );
    if (
      !userId ||
      !albumName ||
      !genre ||
      !type ||
      !img ||
      audioFiles.length === 0
    ) {
      throw new Error("Заполните все поля!");
    }
    if (!img.mimetype.match(/^image\//)) {
      throw new Error("Обложка может быть только изображением!");
    }

    for (const file of audioFiles) {
      if (!file.mimetype.match(/^audio\//)) {
        throw new Error("Треки могут быть только музыкой!");
      }
    }
    // Создаем объекты для каждого трека
    for (let i = 0; body[`trackName${i}`]; i++) {
      const trackName = body[`trackName${i}`];
      const trackCollaborators = body[`trackCollaborators${i}`].split(",");
      const audio = audioFiles[i].filename;
      const track = { trackName, trackCollaborators, audio };
      tracks.push(track);
    }

    // Создаем альбом
    const album = await Album.create({
      title: albumName,
      type,
      UserId: userId,
      img: img.filename,
    });

    // Создаем жанры и связываем их с альбомом
    const genreIds = genre.split(",");
    const genres = await Promise.all(
      genreIds.map(async (genreId) => {
        const genre = await Genre.findByPk(genreId);
        await album.addGenre(genre);
        return genre;
      })
    );

    // Создаем треки и связываем их с альбомом и соавторами
    await Promise.all(
      tracks.map(async (track) => {
        const { trackName, trackCollaborators, audio } = track;
        // Создаем запись в таблице Track
        const createdTrack = await album.createTrack({
          title: trackName,
          audio: audio,
        });

        const collaborators = trackCollaborators.filter(Boolean); // Удаляем пустые значения из массива

        if (collaborators.length === 0) {
          return createdTrack;
        } else {
          // Связываем трек с соавторами
          const coauthors = await Promise.all(
            collaborators.map(async (id) => {
              const coauthor = await Coauthor.create({
                UserId: id,
                TrackId: createdTrack.id,
              });
              return coauthor;
            })
          );

          return createdTrack;
        }
      })
    );

    return "Album and tracks created successfully";
  }

  async update(body, id, img) {
    const { title, type, status } = body;

    const findAlbum = await Album.findByPk(id);
    if (!findAlbum) {
      throw Object.assign(new Error("Альбом не найдён!"), { statusCode: 404 });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (type) updateFields.type = type;
    if (status) updateFields.status = status;
    if (img) {
      if (fs.existsSync(`uploads/images/${findAlbum.img}`)) {
        fs.unlinkSync(`uploads/images/${findAlbum.img}`);
      }
      updateFields.img = img.filename;
    }
    const [numRows, updatedUser] = await Album.update(updateFields, {
      where: { id },
      returning: true,
    });

    if (numRows === 0) {
      throw Object.assign(new Error("Не указаны поля для обновления"), {
        statusCode: 400,
      });
    }

    return updateFields;
  }

  async delete(id) {
    const findAlbum = await Album.findByPk(id);
    const findTracks = await Track.findAll({ where: { AlbumId: id } });
    if (!findAlbum) {
      throw Object.assign(new Error("Альбом не найдён!"), { statusCode: 404 });
    }
    for (const track of findTracks) {
      const audioPath = `uploads/audio/${track.audio}`;
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    const imagePath = `uploads/images/${findAlbum.img}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    const deletedAlbum = await Album.destroy({ where: { id } });

    return deletedAlbum;
  }

  async getMostListenedAlbumsInCurrentMonth(part) {
    let limit = 1;
    let offset = (part - 1) * limit;

    let total = part * limit;

    if (total > 40) {
      return {
        error: "Limit exceeds maximum (3)",
      };
    }

    const month = new Date().getMonth() + 1;

    const albums = await sequelize.query(
      `SELECT Albums.*, 
      COUNT(DISTINCT Auditions.userId) AS auditions,
      Users.nickname AS author  
   FROM Auditions
   JOIN Tracks ON Auditions.TrackId = Tracks.id   
   JOIN Albums ON Tracks.AlbumId = Albums.id
   JOIN Users ON Albums.userId = Users.id 
   WHERE MONTH(Auditions.date_create) = :month AND Albums.status = 2
   GROUP BY Albums.id  
   ORDER BY auditions DESC
   LIMIT :limit OFFSET :offset`,
      {
        replacements: { month, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!albums.length) {
      return {
        error: "Альбомы кончились!",
      };
    }

    return albums;
  }

  async getAlbumsForAuthor(part, userId) {
    const limit = 2;
    const offset = (part - 1) * limit;

    const albums = await Album.findAll({
      attributes: [
        "id",
        "title",
        "img",
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)"
          ),
          "auditions",
        ],
      ],
      where: { status: 2 },
      include: [
        {
          model: Track,
          attributes: ["id", "title", "audio"],
          include: [
            {
              model: Coauthor,
              as: "CoauthorAlias",
              attributes: ["id"],
              include: {
                model: User,
                attributes: ["id", "nickname"],
              },
            },
          ],
        },
        {
          model: User,
          where: {
            id: userId,
          },
          attributes: ["id", "nickname"],
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]], // сортировка поубыванию количества прослушиваний
      offset,
      limit,
    });

    if (!albums.length) {
      return {
        error: "Альбомы кончились!",
      };
    }
    return albums;
  }

  async getAlbumsForGenre(part, genreId) {
    const limit = 2;
    const offset = (part - 1) * limit;

    const albums = await Album.findAll({
      attributes: [
        "id",
        "title",
        "img",
        [
          Sequelize.literal(
            "(SELECT COUNT(DISTINCT Auditions.userId) FROM Tracks INNER JOIN Auditions ON Tracks.id = Auditions.TrackId WHERE Tracks.AlbumId = Album.id)"
          ),
          "auditions",
        ],
      ],
      where: { status: 2 },
      include: [
        {
          model: Genre,
          attributes: ["id", "title"],
          where: { id: genreId },
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]],
      offset,
      limit,
    });

    if (!albums || !albums.length) {
      throw Object.assign(new Error("Альбомов нет!"), { statusCode: 400 });
    }

    return albums;
  }
}
module.exports = new albumService();
