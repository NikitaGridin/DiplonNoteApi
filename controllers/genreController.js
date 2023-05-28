const genreService = require("../service/genreService");
const fs = require("fs");

class genreController {
  async all(req, res, next) {
    const {limit,part} = req.body;
    try {
      const genres = await genreService.all(limit,part);
      res.status(200).send(genres);
    } catch (error) {
      next(error);
    }
  }
  async one(req, res,next) {
    try {
      const genre = await genreService.one(req.params.id)
      res.send(genre).status(200);
    } catch (error) {
      next(error);
    }
  }
  async add(req, res, next){
    const { body, file } = req; 
    try {
      const album = await genreService.add(body, file);
      res.status(200).send(album);
    } catch (error) {
      if (file) {
        fs.unlink(file.path, (err) => {
          if (err) console.log(err);
        });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    const { body, file, params } = req;
    try {
      const genre = await genreService.update(body,params.id,file)
      res.status(200).send('Данные успешно изменены!');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    const {id} = req.params;
  try {
    const genre = await genreService.delete(id)
    res.status(200).send('Жанр удалён!');
  } catch (error) {
    next(error);
  }
  }
}
module.exports = new genreController();


