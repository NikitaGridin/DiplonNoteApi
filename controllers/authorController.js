const authorService = require("../service/authorService");
const fs = require("fs");

class authorController {
  async all(req, res, next) {
    const { part } = req.params;
    try {
      const authors = await authorService.all(part);
      res.status(200).send(authors);
    } catch (error) {
      next(error);
    }
  }
  async one(req, res, next) {
    try {
      const user = await authorService.one(req.params.id);
      res.send(user).status(200);
    } catch (error) {
      next(error);
    }
  }
  async waitAccept(req, res, next) {
    const { part, id } = req.params;
    try {
      const user = await authorService.waitAccept(part, id);
      res.send(user).status(200);
    } catch (error) {
      next(error);
    }
  }
  async getMostListenedAuthorsInCurrentMonth(req, res, next) {
    const { part } = req.params;
    try {
      const authors = await authorService.getMostListenedAuthorsInCurrentMonth(
        part
      );
      res.status(200).send(authors);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new authorController();
