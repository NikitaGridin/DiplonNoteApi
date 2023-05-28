const trackService = require("../service/trackService");

class trackController {
  async all(req, res, next){
    const {part,id,genreId} = req.params;
    console.log(part);
    try {
      const tracks = await trackService.all(part,id,genreId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }

   async one(req, res, next){
    const {id} = req.params;
    try {
      const track = await trackService.one(id);
      res.status(200).send(track);
    } catch (error) {
      next(error)
    }
   }

  async update(req, res, next){
    const { body, file, params } = req;
    try {
      const track = await trackService.update(body,params.id,file)
      res.status(200).send('Данные успешно изменены!');
    } catch (error) {
      next(error)
    }   
  }

  async delete(req, res, next) {
    const {id} = req.params;
    try {
    const album = await trackService.delete(id)
    res.status(200).send('Песня удалёна!');
    } catch (error) {
    next(error);
  }
  }

  async mostListenedTracksInCurrentMonth(req, res, next){
    const {part} = req.params;
    console.log(part);
    try {
      const tracks = await trackService.getMostListenedTracksInCurrentMonth(part);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }

   async mostListenedTracksInCurrentWeek(req, res, next){
    const {part} = req.params;
    console.log(part);
    try {
      const tracks = await trackService.getMostListenedTracksInCurrentWeek(part);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }

   async tracksForAuthor(req, res, next){
    const {part,userId} = req.params;
    console.log(part);
    try {
      const tracks = await trackService.getTracksForAuthor(part, userId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }

   async tracksForGenre(req, res, next){
    const {part,genreId} = req.params;
    console.log(part);
    try {
      const tracks = await trackService.getTracksForGenre(part, genreId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }
}
module.exports = new trackController();
