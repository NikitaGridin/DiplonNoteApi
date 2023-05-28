const adminService = require("../service/adminService");

class adminController {
  async all(req, res, next){
    const {limit,part,status} = req.body;
    try {
      const albums = await adminService.all(limit,part,status);
      res.status(200).send(albums);
    } catch (error) {
      next(error)
    }
   }  
}
module.exports = new adminController();
