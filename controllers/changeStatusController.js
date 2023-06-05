const changeStatusService = require("../service/changeStatusService");

class adminController {
  async application(req, res, next) {
    const { albumId, status } = req.body;
    try {
      const album = await changeStatusService.application(albumId, status);
      res.status(200).send("Статус изменён!");
    } catch (error) {
      next(error);
    }
  }
  async track(req, res, next) {
    const { trackId, userId, status } = req.body;
    try {
      const album = await changeStatusService.track(trackId, userId, status);
      res.status(200).send("Статус изменён!");
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new adminController();
