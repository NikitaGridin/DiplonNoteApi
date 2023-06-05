const connectionsService = require("../service/connectionsService");

class adminController {
  async checkSubscribe(req, res, next) {
    const { recipientId, userId } = req.params;
    try {
      const subscriptionStatus = await connectionsService.checkSubscribe(
        recipientId,
        userId
      );
      res.status(200).send(subscriptionStatus);
    } catch (error) {
      next(error);
    }
  }

  async changeSubscribe(req, res, next) {
    const { id, userId, status } = req.body;
    try {
      const subscribe = await connectionsService.changeSubscribe(
        id,
        userId,
        status
      );
      res.status(200).send(subscribe);
    } catch (error) {
      next(error);
    }
  }
  async allFriends(req, res, next) {
    const { id } = req.params;
    try {
      const friends = await connectionsService.allFriends(id);
      res.status(200).send(friends);
    } catch (error) {
      next(error);
    }
  }
  async allFolowers(req, res, next) {
    const { id } = req.body;
    try {
      const friends = await connectionsService.allFollowers(id);
      res.status(200).send(friends);
    } catch (error) {
      next(error);
    }
  }
  async allFolowing(req, res, next) {
    const { id } = req.body;
    try {
      const friends = await connectionsService.allFolowing(id);
      res.status(200).send(friends);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new adminController();
