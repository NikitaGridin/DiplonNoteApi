const auditionService = require("../service/auditionService");

class auditionController {
  async add(req, res, next){
    const {idUser,idTrack} = req.body;
    try {
      const albums = await auditionService.add(idUser,idTrack);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }  
}
module.exports = new auditionController();
