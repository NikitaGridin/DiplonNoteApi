const {
  User,
  Album,
  Playlist,
  Track,
  Subcribe,
} = require("../models/association");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { Op, Sequelize } = require("@sequelize/core");

class userService {
  async all(limit = 10, part = 1) {
    const offset = (part - 1) * limit;

    const users = await User.findAll({
      attributes: ["id", "nickname", "email", "img", "role"],
      limit,
      offset,
    });
    return users;
  }

  async one(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: [
          "id",
          "nickname",
          "email",
          "img",
          "role",
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM Subcribes where recipientId = ${id})`
            ),
            "subscribes",
          ],
          [
            Sequelize.literal(`(SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(Auditions.date_create, '%Y-%m')) AS aver_per_month  
              FROM Auditions
              JOIN Tracks ON Auditions.TrackId = Tracks.id
              JOIN Albums ON Tracks.AlbumId = Albums.id
              WHERE Albums.UserId = User.id)`),
            "avg_plays",
          ],
        ],
      });

      if (!user) {
        throw Object.assign(new Error("Пользователь не найдён!"), {
          statusCode: 404,
        });
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(body, id, img) {
    const { nickname, email, password } = body;

    const findUser = await User.findByPk(id);
    if (!findUser) {
      throw Object.assign(new Error("Пользователь не найдён!"), {
        statusCode: 404,
      });
    }
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        throw Object.assign(new Error(`Email занят!`), { statusCode: 409 });
      }
    }
    if (nickname) {
      const existingUser = await User.findOne({ where: { nickname } });
      if (existingUser && existingUser.id !== id) {
        throw Object.assign(new Error(`Никнейм занят!`), { statusCode: 409 });
      }
    }

    const updateFields = {};
    if (nickname) updateFields.nickname = nickname;
    if (email) updateFields.email = email;
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updateFields.password = password_hash;
    }
    if (img) {
      await fs.promises.unlink(`uploads/images/${findUser.img}`);
      updateFields.img = img.filename;
    }
    // Обновляем пользователя только с указанными полями
    const [numRows, updatedUser] = await User.update(updateFields, {
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
    const findUser = await User.findByPk(id);
    if (!findUser) {
      throw Object.assign(new Error("Пользователь не найден"), {
        statusCode: 404,
      });
    }
    const imagePath = `uploads/images/${findUser.img}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    const findAlbums = await Album.findAll({ where: { userId: id } });
    const findPlaylists = await Playlist.findAll({ where: { userId: id } }); //find all playlists of this user

    if (findAlbums) {
      findAlbums.forEach((e) => {
        const albumImagePath = `uploads/images/${e.img}`;
        if (fs.existsSync(albumImagePath)) {
          fs.unlinkSync(albumImagePath);
        }
      });
    }
    if (findPlaylists) {
      findPlaylists.forEach((e) => {
        const playlistImagePath = `uploads/images/${e.img}`;
        if (fs.existsSync(playlistImagePath)) {
          fs.unlinkSync(playlistImagePath);
        }
      });
    }
    const albumId = findAlbums.map((album) => album.id);
    const findTracks = await Track.findAll({ where: { albumId: albumId } });

    for (const track of findTracks) {
      const audioPath = `${track.audio}`;
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    const deletedUser = await User.destroy({ where: { id } });
    return deletedUser;
  }
}
module.exports = new userService();
