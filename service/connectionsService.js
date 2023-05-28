const { Subcribe, User } = require("../models/association");

class connectionsService {

  async checkSubscribe(subscriberId, userId) {
    const subscription = await Subcribe.findOne({
      where: {
        id: subscriberId,
        userId: userId
      }
    });

    const subscription2 = await Subcribe.findOne({
      where: {
        userId: subscriberId,
        subscriberId: userId
      }
    });

    return !!subscription;
  }
  async changeSubscribe(id, userId, status) {
    if (status === "delete") {
      await Subcribe.destroy({
        where: {
          subscriberId: id,
          userId: userId
        }
      });
      return "Удалён";
    } else if (status === "add") {
      await Subcribe.create({
        subscriberId: id,
        userId: userId
      });
      return "Добавлен";
    } else {
      throw new Error("Invalid status");
    }
  }
  async allFriends(id) {
    const mySubs = await Subcribe.findAll({
      where: {
        subscriberId: id
      },
      include: [{ model: User, as: "user" }],
    });
    const mySubUsers = mySubs.map((sub) => sub.user);

    const subsToMe = await Subcribe.findAll({
      where: {
        userId: id
      },
      include: [{ model: User, as: "subscriber" }],
    });
    const subsToMeUsers = subsToMe.map((sub) => sub.subscriber);

    const friendIds = mySubUsers
      .filter((user) =>
        subsToMeUsers.some((sub) => sub.id === user.id)
      )
      .map((user) => ({
        id: user.id,
        nickname: user.nickname,
        img: user.img,
      }));

    return friendIds;
  }

  async allFollowers(id) {
    const mySubs = await Subcribe.findAll({
      where: {
        userId: id
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
        subscriberId: id
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