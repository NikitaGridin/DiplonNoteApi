const {
  Track,
  Coauthor,
  User,
  Album,
  LibrayTrack,
  Playlist,
  LibrayPlaylist,
  LibrayAlbum,
} = require("../models/association");
const { sequelize } = require("../db");
const { Op, Sequelize } = require("@sequelize/core");

class librayService {
  async addedTracks(userId) {
    const addedTracks = await LibrayTrack.findAll({
      where: { UserId: userId },
      include: {
        model: Track,
        attributes: ["id"],
      },
      attributes: [], // чтобы исключить поля из таблицы LibrayTrack
    });
    return addedTracks.map((item) => item.Track.id); // возвращаем массив id
  }
  async allTrack(part, userId) {
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
          attributes: ["id", "img"],
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
        {
          model: LibrayTrack,
          where: { UserId: userId },
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
  async addTrack(userId, trackId) {
    const findTrack = await LibrayTrack.findOne({
      where: { UserId: userId, TrackId: trackId },
    });
    if (findTrack) {
      throw new Error("Трек уже добавлен!");
    }
    const addTrack = await LibrayTrack.create({
      UserId: userId,
      TrackId: trackId,
    });
    return addTrack;
  }
  async deleteTrack(userId, trackId) {
    const findTrack = await LibrayTrack.findOne({
      where: { UserId: userId, TrackId: trackId },
    });

    if (!findTrack) {
      throw Object.assign(new Error("Трек не найдён!"), { statusCode: 404 });
    }
    const deleteTrack = await findTrack.destroy();
    return deleteTrack;
  }
  async addedPlaylist(userId) {
    const addedTracks = await LibrayPlaylist.findAll({
      where: { UserId: userId },
      include: {
        model: Playlist,
        attributes: ["id"],
      },
      attributes: [],
    });
    return addedTracks.map((item) => item.Playlist.id);
  }
  async allPlaylist(part, userId) {
    const limit = part === "all" ? null : 10; // если part равен "all", то не задаем лимит
    const offset = part === "all" ? 0 : (part - 1) * limit; // если part равен "all", то смещение равно 0
    const playlist = await Playlist.findAll({
      attributes: ["id", "title", "img"],
      where: { UserId: userId },
      include: [
        {
          model: LibrayPlaylist,
          where: { UserId: userId },
        },
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
      offset,
      limit,
    });
    // if (!playlist.length) {
    //   return {
    //     error: "Плейлисты кончились!",
    //   };
    // }
    return playlist;
  }
  async addPlaylist(playlistId, userId) {
    const findTrack = await LibrayPlaylist.findOne({
      where: { UserId: userId, PlaylistId: playlistId },
    });
    if (findTrack) {
      throw new Error("Плейлист уже добавлен!");
    }
    const addPlaylist = await LibrayPlaylist.create({
      UserId: userId,
      PlaylistId: playlistId,
    });
    return addPlaylist;
  }
  async deletePlaylist(userId, playlistId) {
    const findPlaylist = await LibrayPlaylist.findOne({
      where: { UserId: userId, PlaylistId: playlistId },
    });
    if (!findPlaylist) {
      throw Object.assign(new Error("Плейлист не найдён!"), {
        statusCode: 404,
      });
    }
    const deletePlaylist = await findPlaylist.destroy();
    return deletePlaylist;
  }

  async addedAlbums(userId) {
    const addedTracks = await LibrayAlbum.findAll({
      where: { userId: userId },
      include: {
        model: Album,
        attributes: ["id"],
      },
      attributes: [],
    });
    return addedTracks.map((item) => item.Album.id); // возвращаем массив id
  }
  async allAlbum(part, userId) {
    const limit = 10;
    const offset = (part - 1) * limit;
    const albums = await Album.findAll({
      attributes: [
        "id",
        "title",
        "img",
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
          model: LibrayAlbum,
          where: { UserId: userId },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
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
  async addAlbum(albumId, userId) {
    const findAlbum = await LibrayAlbum.findOne({
      where: { userId: userId, album_id: albumId },
    });
    if (findAlbum) {
      throw new Error("Альбом уже добавлен!");
    }
    const addAlbum = await LibrayAlbum.create({
      userId: userId,
      album_id: albumId,
    });
    return addAlbum;
  }
  async deleteAlbum(userId, albumId) {
    const findAlbum = await LibrayAlbum.findOne({
      where: { UserId: userId, album_id: albumId },
    });
    if (!findAlbum) {
      throw Object.assign(new Error("Альбом не найдён!"), { statusCode: 404 });
    }
    const deleteAlbum = await findAlbum.destroy();
    return findAlbum;
  }
}
module.exports = new librayService();
