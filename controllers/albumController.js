const fs = require("fs");
const albumService = require("../service/albumService");

class albumController {
  async all(req, res, next){
    const {part} = req.body;
    try {
      const albums = await albumService.all(part);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }
   
   async one(req, res,next) {
    try {
      const album = await albumService.one(req.params.id)
      res.send(album).status(200);
    } catch (error) {
      next(error);
    }
  }
   async add(req, res, next){
    const { body, files } = req; // Получаем данные из объекта req
    try {
      const album = await albumService.add(body, files);
      res.status(200).send(album);
    } catch (error) {
      // если произошла ошибка, удаляем добавленные файлы
      if (files && files.img) {
        fs.unlink(files.img[0].path, (err) => {
          if (err) console.log(err);
        });
      }
      if (files && files.audio) {
        for (const file of files.audio) {
          fs.unlink(file.path, (err) => {
            if (err) console.log(err);
          });
        }
      }
      next(error);
    }
  }

  async update(req, res, next){
    const { body, file, params } = req; // Получаем данные из объекта req
    try {
      const album = await albumService.update(body,params.id,file)
      res.status(200).send('Данные успешно изменены!');
    } catch (error) {
      if (file) {
        await fs.promises.unlink(`uploads/images/${file.filename}`);
      }
      next(error)
    }   
  }

  async delete(req, res, next) {
    const {id} = req.params;
    try {
    const album = await albumService.delete(id)
    res.status(200).send('Альбом удалён!');
    } catch (error) {
    next(error);
  }
  }
  

  async mostListenedAlbumsInCurrentMonth(req, res, next){
    const {part} = req.params;
    try {
      const albums = await albumService.getMostListenedAlbumsInCurrentMonth(part);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }

   async mostListenedAlbumsInCurrentWeek(req, res, next){
    const {part} = req.params;
    try {
      const albums = await albumService.getMostListenedAlbumsInCurrentWeek(part);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }

   async albumsForAuthor(req, res, next){
    const {part,userId} = req.params;
    try {
      const albums = await albumService.getAlbumsForAuthor(part, userId);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }

   async albumsForGenre(req, res, next){
    const {part,genreId} = req.params;
    try {
      const albums = await albumService.getAlbumsForGenre(part, genreId);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }
}
module.exports = new albumController();
