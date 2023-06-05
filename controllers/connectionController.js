const connectionsService = require("../service/connectionsService");

class adminController {
  async checkSubscribe(req, res, next) {
    const { subscriberId, userId } = req.body;
    try {
      // проверяем, подписан ли текущий пользователь на пользователя с ID userId
      const isSubscribedToUser = await connectionsService.checkSubscribe(
        subscriberId,
        userId
      );
      // проверяем, подписан ли другой пользователь на пользователя с ID userId
      const isOtherUserSubscribed = await connectionsService.checkSubscribe(
        userId,
        subscriberId
      );

      if (isSubscribedToUser && !isOtherUserSubscribed) {
        res.status(200).send("Отписаться");
      } else if (isOtherUserSubscribed && !isSubscribedToUser) {
        res.status(200).send("Подписан на вас");
      } else if (isSubscribedToUser && isOtherUserSubscribed) {
        res.status(200).send("Вы в друзьях");
      } else {
        res.status(200).send("Подписаться");
      }
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
