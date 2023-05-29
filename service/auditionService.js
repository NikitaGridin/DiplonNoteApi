const { Audition } = require("../models/association");

class auditionService {
  async add(idUser, idTrack) {
    const existingAudition = await Audition.findOne({
      where: {
        UserId: idUser,
        TrackId: idTrack
      }
    });

    if (!existingAudition) {
      await Audition.create({
        UserId: idUser,
        TrackId: idTrack,
      });
    }
  }
}

module.exports = new auditionService();