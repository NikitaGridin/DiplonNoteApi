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

    const query = `
      SELECT 
          a.id, 
          a.title, 
          a.img, 
          a.type, 
          a.status, 
          a.UserId, 
          (SELECT COUNT(*) FROM Tracks t WHERE t.AlbumId = a.id) as trackCount
      FROM 
          Albums a
      WHERE 
          a.status = 1
          AND (
              NOT EXISTS (
                  SELECT 1 
                  FROM Tracks t 
                  INNER JOIN Coauthors c ON t.id = c.TrackId
                  WHERE t.AlbumId = a.id
                    AND c.user_confirm != 2
              )
              OR EXISTS (
                  SELECT 1 
                  FROM Tracks t 
                  INNER JOIN Coauthors c ON t.id = c.TrackId
                  WHERE t.AlbumId = a.id
                    AND c.user_confirm IS NULL
              )
          )
      ORDER BY 
          a.id DESC
      LIMIT 
          ${limit} 
      OFFSET 
          ${offset};
    `;

    const [results, metadata] = await sequelize.query(query);

    if (!results.length) {
      return {
        error: "Альбомы кончились!",
      };
    }

    return results;
  }
}

module.exports = new albumService();
