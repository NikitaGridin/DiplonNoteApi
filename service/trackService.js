const { Op, Sequelize } = require("@sequelize/core");
const { sequelize } = require("../db");

const {
  Track,
  Coauthor,
  User,
  Album,
  Genre,
  Audition,
} = require("../models/association");
const fs = require("fs");

class trackService {
  async all(part) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
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
        {
          model: Album,
          attributes: ["id", "img", "status", "UserId"],
          where: { status: 2 },
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
      ],

      offset,
      limit,
    });
    if (!tracks.length) {
      return {
        error: "Треки кончились!",
      };
    }
    return tracks;
  }

  async one(id) {
    const findTrack = await Track.findAll({
      where: { id },
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
        {
          model: Album,
          attributes: ["id", "img"],
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
      ],
    });
    if (!findTrack) {
      throw Object.assign(new Error("Трек не найден!"), { statusCode: 400 });
    }
    return findTrack;
  }

  async update(body, id) {
    const { title } = body;

    const findAlbum = await Track.findByPk(id);
    if (!findAlbum) {
      throw Object.assign(new Error("Трек не найдён!"), { statusCode: 404 });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    const [numRows, updateTrack] = await Track.update(updateFields, {
      where: { id },
      returning: true,
    });

    if (numRows === 0) {
      throw Object.assign(new Error("Не указаны поля для обновления"), {
        statusCode: 400,
      });
    }

    return updateTrack;
  }

  async delete(id) {
    const findTrack = await Track.findByPk(id);
    if (!findTrack) {
      throw Object.assign(new Error("Трек не найдён!"), { statusCode: 404 });
    }
    if (fs.existsSync(findTrack.audio)) {
      fs.unlinkSync(findTrack.audio);
    }
    const albumId = findTrack.AlbumId;
    const tracks = await Track.findAll({ where: { albumId } });
    const deleteTrack = await Track.destroy({ where: { id } });
    const imagePath = `uploads/audio/${findTrack.audio}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    if (tracks.length === 1) {
      const findAlbum = await Album.findByPk(albumId);
      if (!findAlbum) {
        throw Object.assign(new Error("Альбом не найден!"), {
          statusCode: 404,
        });
      }
      await Album.destroy({ where: { id: albumId } });
      const imagePath = `uploads/images/${findAlbum.img}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    return deleteTrack;
  }

  async getMostListenedTracksInCurrentMonth(part) {
    let limit = 10;
    const offset = (part - 1) * limit;

    let total = part * limit;

    if (total > 40) {
      return {
        error: "Limit exceeds maximum (3)",
      };
    }
    const month = new Date().getMonth() + 1;

    const tracks = await Track.findAll({
      attributes: [
        "id",
        "title",
        "audio",
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM Auditions WHERE Auditions.TrackId = Track.id AND MONTH(Auditions.date_create) = ${month})`
          ),
          "auditions",
        ],
      ],
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
        {
          model: Album,
          attributes: ["id", "img", "status", "UserId"],
          where: { status: 2 },

          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
      ],
      where: Sequelize.literal(
        `(SELECT COUNT(*) FROM Auditions WHERE Auditions.TrackId = Track.id AND MONTH(Auditions.date_create) = ${month}) > 0`
      ),
      order: [[Sequelize.literal("auditions DESC")]],
      offset,
      limit,
    });
    if (!tracks || !tracks.length) {
      return {
        error: "Треки кончились!",
      };
    }

    return tracks;
  }

  async getTracksForAuthor(part, userId) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
      where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
      attributes: [
        "id",
        "title",
        "audio",
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id)"
          ),
          "auditions",
        ],
      ],
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
        {
          model: Album,
          attributes: ["id", "img"],
          where: { UserId: userId, status: 2 },
          include: {
            model: User,
            where: {
              id: userId,
            },
            attributes: ["id", "nickname"],
          },
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]], // сортировка поубыванию количества прослушиваний
      offset,
      limit,
    });

    if (!tracks || !tracks.length) {
      return {
        error: "Треки кончились!",
      };
    }
    return tracks;
  }

  async getTracksForGenre(part, genreId) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
      where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
      attributes: [
        "id",
        "title",
        "audio",
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id)"
          ),
          "auditions",
        ],
      ],
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
        {
          model: Album,
          attributes: ["id", "img", "UserId"],
          where: { status: 2 },
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Genre,
              attributes: ["id", "title"],
              where: {
                id: genreId,
              },
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]], // сортировка поубыванию количества прослушиваний
      offset,
      limit,
    });

    if (!tracks) {
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });
    }
    return tracks;
  }

  async latest(part, userId) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
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
        {
          model: Album,
          attributes: ["id", "img", "UserId"],
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: Audition,
          attributes: ["id"],
          include: {
            model: User,
            attributes: ["id"],
            where: { id: userId },
          },
          order: [["date_create", "DESC"]],
        },
      ],
      order: [[Sequelize.literal('"Auditions.date_create" DESC')]], // сортировка по дате прослушивания
      offset,
      limit,
    });

    if (!tracks.length) {
      return {
        error: "Треки кончились!",
      };
    }

    return tracks;
  }

  async getTrackFoCoauthor(part, userId) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
      where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
      attributes: [
        "id",
        "title",
        "audio",
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id)"
          ),
          "auditions",
        ],
      ],
      include: [
        {
          model: Coauthor,
          as: "CoauthorAlias",
          attributes: ["id"],
          where: { UserId: userId },
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
        {
          model: Album,
          attributes: ["id", "img"],
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]], // сортировка поубыванию количества прослушиваний
      offset,
      limit,
    });

    if (!tracks || !tracks.length) {
      return {
        error: "Треки кончились!",
      };
    }
    return tracks;
  }
}
module.exports = new trackService();
