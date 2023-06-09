const { sequelize } = require("../db");
const {
  Playlist,
  AlbumGenre,
  Track,
  Album,
  Coauthor,
  User,
  LibrayPlaylist,
  PlaylistTrack,
} = require("../models/association");
const fs = require("fs");

class playlistService {
  async all(part) {
    const limit = 4;
    const offset = (part - 1) * limit;
    const playlists = await Playlist.findAll({
      include: {
        model: User,
        attributes: ["id", "nickname"],
      },
      limit: limit,
      offset: offset,
    });
    if (!playlists.length) {
      return {
        error: "Плейлисты кончились!",
      };
    }
    return playlists;
  }

  async one(id) {
    const playlist = await Playlist.findByPk(id, {
      include: [
        {
          model: Track,
          through: { attributes: [] },
          attributes: ["id", "title", "audio"],
          include: [
            {
              model: Coauthor,
              as: "CoauthorAlias",
              include: {
                model: User,
                attributes: ["id", "nickname"],
              },
            },
            {
              model: Album,
              attributes: ["id", "img"],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });
    if (!playlist) {
      throw Object.assign(new Error("Плейлист не найден!"), {
        statusCode: 400,
      });
    }

    return playlist;
  }

  async add(body, file) {
    const { title, userId } = body;

    if (!title || !userId || !file) {
      throw Object.assign(new Error("Пожалуйста, заполните все поля!"), {
        statusCode: 400,
      });
    }

    const newPlaylist = await Playlist.create({
      title: title,
      img: file.filename,
      UserId: userId,
    });

    const newLibraryPlaylist = await LibrayPlaylist.create({
      PlaylistId: newPlaylist.id,
      UserId: userId,
    });

    return { newPlaylist };
  }

  async update(body, id, img) {
    const { title } = body;

    const findPlaylist = await Playlist.findByPk(id);
    if (!findPlaylist) {
      throw Object.assign(new Error("Плейлист не найдён!"), {
        statusCode: 404,
      });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (img) {
      if (fs.existsSync(`uploads/images/${findPlaylist.img}`)) {
        fs.unlinkSync(`uploads/images/${findPlaylist.img}`);
      }
      updateFields.img = img.filename;
    }
    const [numRows, updatedPlaylist] = await Playlist.update(updateFields, {
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
    const findPlaylist = await Playlist.findByPk(id);
    if (!findPlaylist) {
      throw Object.assign(new Error("Плейлист не найдён!"), {
        statusCode: 404,
      });
    }
    const imagePath = `uploads/images/${findPlaylist.img}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    const deleteTrack = await findPlaylist.destroy();

    return deleteTrack;
  }
  async trackInPlaylist(trackId, playlistId) {
    const playlist = await PlaylistTrack.findOne({
      where: {
        TrackId: trackId,
        PlaylistId: playlistId,
      },
    });
    if (!playlist) {
      const newPlaylist = await PlaylistTrack.create({
        TrackId: trackId,
        PlaylistId: playlistId,
      });
      return newPlaylist;
    } else {
      await playlist.destroy();
      return {
        message: "Трек удален из плейлиста",
      };
    }
  }
  async getPlaylistForAuthor(userId) {
    const playlists = await Playlist.findAll({
      attributes: ["id", "title", "img"],
      where: { UserId: userId },
      include: [
        {
          model: Track,
          attributes: ["id"],
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });

    return playlists;
  }
}

module.exports = new playlistService();
