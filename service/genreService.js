const { sequelize } = require("../db");
const { Genre, Album, Audition, Track } = require("../models/association");
const fs = require("fs");
const { Op, Sequelize } = require("@sequelize/core");

class genreService {
  async all(part) {
    const limit = 4;
    const offset = (part - 1) * limit;

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
          "count_tracks",
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
      const findAlbum = await Album.findAll({ where: { title } });
      if (findAlbum) {
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

    return updatedUser;
  }

  async delete(id) {
    const findGenre = await Genre.findByPk(id);
    if (!findGenre) {
      throw Object.assign(new Error("Жанр не найден"), { statusCode: 404 });
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
          Sequelize.literal(
            "(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE MONTH(Auditions.date_create) = :month AND Tracks.AlbumId IN (SELECT Albums.id FROM Albums JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId WHERE AlbumGenres.GenreId = Genres.id))"
          ),
          "auditions",
        ],
      ],
      replacements: { month },
      having: Sequelize.literal("auditions > 0"),
      order: [[Sequelize.literal("auditions DESC")]], // сортировка по убыванию количества прослушиваний
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
