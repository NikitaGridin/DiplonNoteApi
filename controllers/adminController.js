const adminService = require("../service/adminService");

class adminController {
  async all(req, res, next) {
    const { part, status } = req.params;
    try {
      const albums = await adminService.all(part, status);
      res.status(200).send(albums);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new adminController();
