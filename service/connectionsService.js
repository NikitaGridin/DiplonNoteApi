const { Subcribe, User } = require("../models/association");
const { sequelize } = require("../db");

class connectionsService {
  async checkSubscribe(recipientId, userId) {
    const subscription = await Subcribe.findOne({
      where: {
        recipientId: userId,
        senderIdId: recipientId,
      },
    });

    const reverseSubscription = await Subcribe.findOne({
      where: {
        recipientId: recipientId,
        senderIdId: userId,
      },
    });
    console.log(subscription, reverseSubscription);
    if (!subscription && !reverseSubscription) {
      return "Подписаться";
    } else if (subscription && !reverseSubscription) {
      return "Отписаться";
    } else if (!subscription && !reverseSubscription) {
      return "Отписаться";
    } else if (subscription && reverseSubscription) {
      return "Вы в друзьях";
    } else {
      return "На вас подписан";
    }
  }
  async changeSubscribe(id, userId, status) {
    if (status === "delete") {
      await Subcribe.destroy({
        where: {
          recipientId: id,
          senderIdId: userId,
        },
      });
      return "Подписаться";
    } else if (status === "add") {
      await Subcribe.create({
        recipientId: id,
        senderIdId: userId,
      });
      return "Отписаться";
    } else {
      throw new Error("Invalid status");
    }
  }
  async allFriends(id) {
    const friends = await sequelize.query(
      `
      SELECT u.nickname, u.img, u.id
      FROM Users AS u
      INNER JOIN Subcribes AS s1 ON u.id = s1.recipientId
      INNER JOIN Subcribes AS s2 ON u.id = s2.senderIdId
      WHERE s1.senderIdId = ${id} AND s2.recipientId = ${id};
    `
    );
    return friends[0];
  }

  async allFollowers(id) {
    const mySubs = await Subcribe.findAll({
      where: {
        userId: id,
      },
      attributes: ["subscriberId"],
    });

    const mySubscribers = [];

    for (const sub of mySubs) {
      const user = await User.findOne({
        where: {
          id: sub.subscriberId,
        },
        attributes: ["id", "nickname", "img"],
      });
      mySubscribers.push(user);
    }

    return mySubscribers;
  }

  async allFolowing(id) {
    const mySubs = await Subcribe.findAll({
      where: {
        subscriberId: id,
      },
      attributes: ["userId"],
    });

    const mySubscribers = [];

    for (const sub of mySubs) {
      const user = await User.findOne({
        where: {
          id: sub.userId,
        },
        attributes: ["id", "nickname", "img"],
      });
      mySubscribers.push(user);
    }

    return mySubscribers;
  }
}

module.exports = new connectionsService();
