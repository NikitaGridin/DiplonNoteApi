const { sequelize } = require("../db");
const {
  Album,
  Track,
  Genre,
  User,
  Coauthor,
} = require("../models/association");

class albumService {
  async all(part = 1, status) {
    const limit = 10;
    const offset = (part - 1) * limit;
    const albums = await Album.findAll({
      attributes: [
        "id",
        "title",
        "img",
        "type",
        "status",
        "UserId",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM Tracks WHERE Tracks.AlbumId = Album.id)"
          ),
          "trackCount",
        ],
      ],
      where: { status: 1 },
      include: [
        {
          model: Genre,
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Track,
          include: [
            {
              model: Coauthor,
              as: "CoauthorAlias",

              where: { user_confirm: 2 },
              required: true,
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
    });
    if (!albums.length) {
      return {
        error: "Альбомы кончились!",
      };
    }
    return albums;
  }
}

module.exports = new albumService();
