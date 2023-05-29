const { sequelize } = require('../db');
const { Album, Track, User, Genre, Coauthor } = require('../models/association');
const { Op, Sequelize } = require("@sequelize/core");

class searchService {
  async search(searchQuery) {
    const tracks = await Track.findAll({ 
      where: [
        {
          [Op.and]: [
            Sequelize.literal(`EXISTS (SELECT 1 FROM Albums WHERE Albums.id = Track.AlbumId AND Albums.status = 2)`),
            { title: { [Op.like]: '%' + searchQuery + '%' } }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'audio',
        [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id)'), 'auditions']
      ],
      include: [      
        {
          model: Coauthor,      
          as: "CoauthorAlias",       
          attributes: ['id'],        
          include: {               
            model: User,                
            attributes: ['id','nickname'],
          },
        },
        {              
          model: Album,  
          attributes: ['id', 'img'],
          include: {               
            model: User,               
            attributes: ['id', 'nickname'],
           }
         }
      ],
      order: [[Sequelize.literal('auditions DESC')]], // сортировка по убыванию количества прослушиваний
      limit: 10
    });
    const albums = await Album.findAll({
      attributes: [
        'id',
        'title',
        'img',
        [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']
      ],
      where: [{status: 2}, {title: { [Op.like]: '%' + searchQuery + '%' }}],
      include: [{
        model: Track,
        attributes: [
          'id',
          'title',
          'audio',
        ],
        include: [      
          {
            model: Coauthor,      
            as: "CoauthorAlias",       
            attributes: ['id'],        
            include: {               
              model: User,                
              attributes: ['id','nickname'],
            }  
          },     
        ],
      },
      {model: User,
        attributes: ['id','nickname']
    } 
    ],
      limit:5
    });
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