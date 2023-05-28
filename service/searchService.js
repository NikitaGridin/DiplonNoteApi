const { sequelize } = require('../db');
const { Album, Track, User, Genre } = require('../models/association');
const { Op } = require("@sequelize/core");

class searchService {
  async search(searchQuery) {
    const tracks = await Track.findAll({
      attributes: ['id','title','audio'],
      include: {
        model: Album,
        attributes: ['id','img'],
      },
      where: {
        title: { [Op.like]: '%' + searchQuery + '%' },
      },
      limit: 5
    })
    const albums = await Album.findAll({
      attributes: ['id','title','img','type'],
      include: {
        model: Genre,
        attributes: ['id','title','img'],
        through: { attributes: [] }
      },
      where: {
        title: { [Op.like]: '%' + searchQuery + '%' },
        status: 2
      },
      limit: 5
    })
    const users = await User.findAll({
      attributes: ['id','nickname','img'],
      where: {
        nickname: { [Op.like]: '%' + searchQuery + '%' },
      },
      limit: 5   
    })
    return {tracks,albums,users};
  }
}

module.exports = new searchService();