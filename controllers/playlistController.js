const fs = require("fs");
const playlistService = require("../service/playlistService");

class playlistController {
  async all(req, res, next) {
    const { part } = req.params;
    try {
      const playlists = await playlistService.all(part);
      res.status(200).send(playlists);
    } catch (error) {
      next(error);
    }
  }

  async one(req, res, next) {
    try {
      const album = await playlistService.one(req.params.id);
      res.send(album).status(200);
    } catch (error) {
      next(error);
    }
  }
  async add(req, res, next) {
    const { body, file } = req; // Получаем данные из объекта req
    try {
      const playlist = await playlistService.add(body, file);
      res.status(200).send(playlist);
    } catch (error) {
      // если произошла ошибка, удаляем добавленные файлы
      if (file) {
        fs.unlink(file.path, (err) => {
          if (err) console.log(err);
        });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    const { body, file, params } = req; // Получаем данные из объекта req
    try {
      const album = await playlistService.update(body, params.id, file);
      res.status(200).send("Данные успешно изменены!");
    } catch (error) {
      if (file) {
        await fs.promises.unlink(`uploads/images/${file.filename}`);
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      const playlist = await playlistService.delete(id);
      res.status(200).send("Плейлист удалён!");
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new playlistController();
