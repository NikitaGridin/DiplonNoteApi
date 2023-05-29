const { Album, Coauthor } = require("../models/association");

class changeStatusService {
  async application(id, status) {
    const findAlbum = await Album.findByPk(id);
  
    if (!findAlbum) {
      throw Object.assign(new Error("Альбом не найден!"), { statusCode: 400 });
    }

    findAlbum.status = status;
    await findAlbum.save();
  
    return findAlbum;
  }
  async track(trackId, userId, status) {
    const userTrack = await Coauthor.findOne({
      where: {
        TrackId: trackId,
        UserId: userId
      }
    });

    if (!userTrack) {
      throw Object.assign(new Error("Трек не найден!"), { statusCode: 400 });
    }

    userTrack.user_confirm = status;
    await userTrack.save();

    return userTrack;
  }
}


module.exports = new changeStatusService();