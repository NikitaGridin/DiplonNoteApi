const { sequelize } = require("../db");
const { Genre, Album, Audition, Track } = require("../models/association");
const fs = require("fs");
const { Op, Sequelize } = require("@sequelize/core");

class genreService {
  async all(part) {
    let limit, offset;

    if (part === "all") {
      limit = null;
      offset = null;
    } else {
      limit = 20;
      offset = (part - 1) * limit;
    }

    const genres = await Genre.findAll({
      attributes: [
        "id",
        "title",
        "img",
        [
          sequelize.literal(`(SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(Auditions.date_create, '%Y-%m')) AS aver_per_month  
        FROM Auditions
        JOIN Tracks ON Auditions.TrackId = Tracks.id
        JOIN Albums ON Tracks.AlbumId = Albums.id
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId
        WHERE AlbumGenres.GenreId = Genres.id)`),
          "avg_plays",
        ],
      ],
      offset: offset,
      limit: limit,
    });
    if (!genres.length) {
      return {
        error: "Жанры кончились!",
      };
    }
    return genres;
  }

  async one(id) {
    const genre = await Genre.findByPk(id, {
      attributes: [
        "id",
        "title",
        "img",
        [
          sequelize.literal(`(SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(Auditions.date_create, '%Y-%m')) AS aver_per_month  
        FROM Auditions
        JOIN Tracks ON Auditions.TrackId = Tracks.id
        JOIN Albums ON Tracks.AlbumId = Albums.id
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId
        WHERE AlbumGenres.GenreId = ${id})`),
          "avg_plays",
        ],
      ],
    });

    return genre;
  }

  async add(body, file, next) {
    try {
      const { title } = body;
      if (!title) {
        throw Object.assign(new Error("Пожалуйста, заполните все поля!"), {
          statusCode: 400,
        });
      }
      const findGenre = await Genre.findOne({ where: { title } });
      if (findGenre) {
        throw Object.assign(new Error("Жанр уже существует!"), {
          statusCode: 400,
        });
      }
      const newGenre = await Genre.create({
        title,
        img: file.filename,
      });

      return { newGenre };
    } catch (error) {
      throw error;
    }
  }

  async update(body, id, img) {
    const { title } = body;

    const findGenre = await Genre.findByPk(id);
    if (!findGenre) {
      throw Object.assign(new Error("Жанр не найдён!"), { statusCode: 404 });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (img) {
      if (fs.existsSync(`uploads/images/${findGenre.img}`)) {
        fs.unlinkSync(`uploads/images/${findGenre.img}`);
      }
      updateFields.img = img.filename;
    }
    const [numRows, updatedUser] = await Genre.update(updateFields, {
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
    const findGenre = await Genre.findByPk(id);
    if (!findGenre) {
      throw Object.assign(new Error("Жанр не найден"), { statusCode: 404 });
    }
    const imagePath = `uploads/images/${findGenre.img}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    const deleteGenre = await Genre.destroy({ where: { id } });
    return deleteGenre;
  }

  async getMostListenedTracksInCurrentMonth(part) {
    const limit = 2;
    const offset = (part - 1) * limit;

    const month = new Date().getMonth() + 1;

    const genres = await Genre.findAll({
      attributes: [
        "id",
        "title",
        "img",
        [
          sequelize.literal(`(SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(Auditions.date_create, '%Y-%m')) AS aver_per_month  
        FROM Auditions
        JOIN Tracks ON Auditions.TrackId = Tracks.id
        JOIN Albums ON Tracks.AlbumId = Albums.id
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId
        WHERE AlbumGenres.GenreId = Genres.id)`),
          "avg_plays",
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
        error: "Жанры кончились!",
      };
    }
    return genres;
  }
}
module.exports = new genreService();
