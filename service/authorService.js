const { User, Genre, Album, Track, Coauthor } = require("../models/association");
const { sequelize } = require("../db");

class authorService {

  async all(limit = 10, part = 1, genreId) {
    const offset = (part - 1) * limit; 
    let include = [
      {
        model: Album,
        attributes: ['id'] 
      }   
    ];
  
    if (genreId) {
      include = [
        {
          model: Album,
          attributes: ['id'], 
          include: {
            model: Genre,
            attributes: ['id'],
            where: {id: genreId},
            through: { attributes: [] }
          }      
        }  
      ];
    }
  
    const users = await User.findAll({
    attributes: [
      'id',
      'nickname',
      'img',
      [sequelize.literal(
        `(SELECT COUNT(*) FROM Auditions 
        JOIN Tracks ON Auditions.TrackId = Tracks.id 
        JOIN Albums ON Tracks.AlbumId = Albums.id 
        WHERE Albums.UserId = User.id)`), 'auditions'
      ],
      [sequelize.literal(`
        (SELECT Genres.title    
        FROM Albums
        JOIN AlbumGenres ON Albums.id = AlbumGenres.AlbumId  
        JOIN Genres ON AlbumGenres.GenreId = Genres.id
        WHERE Albums.UserId = User.id  
        GROUP BY Genres.id  
        LIMIT 1)`), 'popular_genre'
    ]
    ],
    include,
    limit,
    offset
    })
    return users;
  }
  
  async one(id) {
    const user = await User.findByPk(id,{attributes : ['id','nickname','email','img']});
      if(!user){
        throw Object.assign(new Error('Пользователь не найдён!'), { statusCode: 404 });
      }
      return user;
  }

  async waitAccept(limit=20,part=1,id) {
    const offset = (part - 1) * limit;
    
    const [results] = await Track.findAll({
      include: 
      [
        {
        model: Coauthor,
        as: "CoauthorAlias",
        where: {UserId:id},
        attributes: ['id'],
        include :{
          model: User,
          attributes: ['id','nickname']
        }
      },
      {
        model: Album,
        attributes: ['id','img']
      },
    ]
    });

    if(!results){
        throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });
    }
    return results;
  }


  
}
module.exports = new authorService();


