const authorService = require("../service/authorService");
const fs = require("fs");

class authorController {
  async all(req, res, next) {
    const {limit,part, genreId} = req.body;
    try {
      const authors = await authorService.all(limit,part, genreId);
      res.status(200).send(authors);
    } catch (error) {
      next(error);
    }
  }
  async one(req, res,next) {
    try {
      const user = await authorService.one(req.params.id)
      res.send(user).status(200);
    } catch (error) {
      next(error);
    }
  }
  async waitAccept(req, res,next) {
    const {limit,part,id} = req.body;
    try {
      const user = await authorService.waitAccept(limit,part,id)
      res.send(user).status(200);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new authorController();


