const { Sequelize } = require("@sequelize/core");
const { sequelize } = require("../db");
const {
  Album,
  Track,
  User,
  Genre,
  Coauthor,
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
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)"
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
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)"
          ),
          "auditions",
        ],
      ],
      include: [
        {
          model: Track,
          attributes: ["id", "title", "audio"],
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
    const { title, type, genres, userId, coauthors, titleTrack } = body;
    // Создаем альбом
    const album = await Album.create({
      title,
      type,
      status: 1,
      UserId: userId,
      img: files.img[0].path,
    });

    // Создаем треки
    const tracks = [];
    for (let i = 0; i < files.audio.length; i++) {
      const audioPath = files.audio[i].path;
      const title = titleTrack[i];
      const track = await Track.create({
        title,
        audio: audioPath,
        AlbumId: album.id,
      });
      tracks.push(track);
    }

    return "Good";
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

    return updatedUser;
  }

  async delete(id) {
    const findAlbum = await Album.findByPk(id);
    const findTracks = await Track.findAll({ where: { albumId: id } });
    if (!findAlbum) {
      throw Object.assign(new Error("Альбом не найдён!"), { statusCode: 404 });
    }
    for (const track of findTracks) {
      const audioPath = `${track.audio}`;
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
      COUNT(*) AS auditions,
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

    const tracks = await Album.findAll({
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
      include: {
        model: Genre,
        attributes: ["id", "title"],
        where: {
          id: genreId,
        },
        through: { attributes: [] },
      },
      order: [[Sequelize.literal("auditions DESC")]], // сортировка поубыванию количества прослушиваний
      offset,
      limit,
    });

    if (!tracks) {
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });
    }
    return tracks;
  }
}
module.exports = new albumService();
