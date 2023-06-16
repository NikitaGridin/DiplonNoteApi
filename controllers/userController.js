const userService = require("../service/userService");
const fs = require("fs");

class userController {
  async all(req, res, next) {
    const users = await userService.all();
    try {
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  }
  async one(req, res, next) {
    try {
      const user = await userService.one(req.params.id);
      res.send(user).status(200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    const { body, file, params } = req;
    try {
      const user = await userService.update(body, params.id, file);
      res.status(200).send(user);
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
      const user = await userService.delete(id);
      res.status(200).send("Пользователь удалён!");
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new userController();
