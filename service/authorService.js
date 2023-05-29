const { User, Genre, Album, Track, Coauthor } = require("../models/association");
const { sequelize } = require("../db");
const { Op, Sequelize } = require('@sequelize/core');

class authorService {

  async all(part = 1) {
    const limit = 10;
    const offset = (part - 1) * limit; 
    let include = [
      {
        model: Album,
        attributes: ['id'] 
      }   
    ];
  
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

  async waitAccept(part,id) {
    const limit=20;
    const offset = (part - 1) * limit;
    
    const [results] = await Track.findAll({
      include: 
      [
        {
        model: Coauthor,
        as: "CoauthorAlias",
        where: {
          UserId: id,
          user_confirm: {
            [Op.or]: [1, 3]    
          }  
        },
        attributes: ['id'],
        include :{
          model: User,
          attributes: ['id','nickname']
        }
      },
      {
        model: Album,
        attributes: ['id','img'],
        include :{
          model: User,
          attributes: ['id','nickname']
        }
      },
    ],
    limit:limit,
    offset:offset,
    });

    if(!results){
        throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });
    }
    return results;
  }


  
}
module.exports = new authorService();


