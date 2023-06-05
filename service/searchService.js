const { sequelize } = require("../db");
const {
  Album,
  Track,
  User,
  Genre,
  Coauthor,
  Playlist,
} = require("../models/association");
const { Op, Sequelize } = require("@sequelize/core");

class searchService {
  async search(searchQuery) {
    const tracks = await Track.findAll({
      where: [
        {
          [Op.and]: [
            Sequelize.literal(
              `EXISTS (SELECT 1 FROM Albums WHERE Albums.id = Track.AlbumId AND Albums.status = 2)`
            ),
            { title: { [Op.like]: "%" + searchQuery + "%" } },
          ],
        },
      ],
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
          include: {
            model: User,
            attributes: ["id", "nickname"],
          },
        },
      ],
      order: [[Sequelize.literal("auditions DESC")]],
      limit: 10,
    });
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
      where: [{ status: 2 }, { title: { [Op.like]: "%" + searchQuery + "%" } }],
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
        { model: User, attributes: ["id", "nickname"] },
      ],
      limit: 5,
    });
    const users = await User.findAll({
      attributes: ["id", "nickname", "img"],
      where: {
        nickname: { [Op.like]: "%" + searchQuery + "%" },
      },
      limit: 5,
    });
    const genres = await Genre.findAll({
      attributes: [
        "id",
        "title",
        "img",
        [
          sequelize.literal(`(SELECT COUNT(*) AS total_tracks 
        FROM tracks 
        JOIN Albums ON tracks.albumId = Albums.id
        JOIN AlbumGenres ON Albums.id = AlbumGenres.albumId 
        WHERE AlbumGenres.genreId = Genres.id)`),
          "auditions",
        ],
      ],
      where: {
        title: { [Op.like]: "%" + searchQuery + "%" },
      },
      limit: 5,
    });
    const playlists = await Playlist.findAll({
      attributes: ["id", "title", "img"],
      where: {
        title: { [Op.like]: "%" + searchQuery + "%" },
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM Auditions JOIN PlaylistsTracks ON Auditions.TrackId = PlaylistsTracks.TrackId WHERE PlaylistsTracks.PlaylistId = Playlists.id)"
            ),
            "auditions",
          ],
        ],
      },
      include: {
        model: User,
        attributes: ["id", "nickname"],
      },
      limit: 5,
    });
    return { tracks, albums, users, genres, playlists };
  }
}

module.exports = new searchService();
