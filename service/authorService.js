const {
  User,
  Genre,
  Album,
  Track,
  Coauthor,
} = require("../models/association");
const { sequelize } = require("../db");
const { Op, Sequelize } = require("@sequelize/core");

class authorService {
  async all(part) {
    const limit = 10;
    const offset = (part - 1) * limit;
    let include = [
      {
        model: Album,
        attributes: ["id"],
      },
    ];

    const users = await User.findAll({
      attributes: [
        "id",
        "nickname",
        "img",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM Auditions 
        JOIN Tracks ON Auditions.TrackId = Tracks.id 
        JOIN Albums ON Tracks.AlbumId = Albums.id 
        WHERE Albums.UserId = User.id AND Albums.status = 2)`
          ),
          "avg_plays",
        ],
        [
          sequelize.literal(`
          (SELECT Genres.title
            FROM Albums
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId  
        JOIN Genres ON AlbumGenres.GenreId = Genres.id
        WHERE Albums.UserId = User.id  
        GROUP BY Genres.id  
        LIMIT 1)`),
          "popular_genre",
        ],
      ],
      include,
      limit,
      offset,
    });
    return users;
  }

  async one(id) {
    const user = await User.findByPk(id, {
      attributes: ["id", "nickname", "email", "img"],
    });
    if (!user) {
      throw Object.assign(new Error("Пользователь не найдён!"), {
        statusCode: 404,
      });
    }
    return user;
  }

  async waitAccept(part, id) {
    const limit = 20;
    const offset = (part - 1) * limit;

    const [results] = await Track.findAll({
      include: [
        {
          model: Coauthor,
          as: "CoauthorAlias",
          where: {
            UserId: id,
            user_confirm: {
              [Op.or]: [1],
            },
          },
          attributes: ["id", "user_confirm"],
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
      limit: limit,
      offset: offset,
    });

    if (!results) {
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });
    }
    return results;
  }

  async getMostListenedAuthorsInCurrentMonth(part) {
    const limit = 2;
    const offset = (part - 1) * limit;

    const month = new Date().getMonth() + 1;

    const genres = await User.findAll({
      attributes: [
        "id",
        "nickname",
        "img",
        [
          sequelize.literal(`(SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(Auditions.date_create, '%Y-%m')) AS aver_per_month  
            FROM Auditions
            JOIN Tracks ON Auditions.TrackId = Tracks.id
            JOIN Albums ON Tracks.AlbumId = Albums.id
            WHERE Albums.UserId = User.id AND Albums.status = 2)`),
          "avg_plays",
        ],
        [
          sequelize.literal(`
        (SELECT Genres.title
        FROM Albums
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId  
        JOIN Genres ON AlbumGenres.GenreId = Genres.id
        WHERE Albums.UserId = User.id  
        GROUP BY Genres.id  
        LIMIT 1)`),
          "popular_genre",
        ],
      ],
      replacements: { month },
      having: Sequelize.literal("avg_plays > 0"),
      order: [[Sequelize.literal("avg_plays DESC")]],
      offset,
      limit,
    });
    if (!genres.length) {
      return {
        error: "Исполнители кончились!",
      };
    }
    return genres;
  }
}
module.exports = new authorService();
