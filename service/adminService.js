const { sequelize } = require('../db');
const { Album, Track, Genre, User } = require('../models/association');

class albumService {
  async all(limit = 10, part = 1, status) {
    const offset = (part - 1) * limit;
    const albums = await Album.findAll({
      attributes: [
        'id',
        'title',
        'img',
        'type',
        'status',
        'UserId',
        [sequelize.literal('(SELECT COUNT(*) FROM Tracks WHERE Tracks.AlbumId = Album.id)'), 'trackCount']
      ],
      where: { status },
      include: [
        {
          model: Genre,
          attributes: ['id', 'title'],
          through: { attributes: [] }
        },
        {
          model: User,
          attributes: ['id', 'nickname']
        }
      ],
      limit: limit,
      offset: offset
    });
    return albums;
  }
}

module.exports = new albumService();