const { Op, Sequelize } = require('@sequelize/core');
const { Track, Coauthor, User, Album, Genre, Audition } = require("../models/association");
const fs = require("fs");

class trackService {
  async all(part) {
    const limit = 2;
    const offset = (part - 1) * limit;

    const tracks = await Track.findAll({
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
          attributes: ['id','img'],
          include: {
            model: User,
            attributes: ['id','nickname']
          }
        }        
      ],
      offset,
      limit  
    });

    if(!tracks){
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400});  
    } 
    return tracks;
}

  async one(id) {
    const findTrack = await Track.findByPk(id);

    if(!findTrack){
        throw Object.assign(new Error("Трек не найден!"), { statusCode: 400 });
    }
    return findTrack;
  }

  async update(body, id) {
    const {title} = body;

    const findAlbum = await Track.findByPk(id);
    if(!findAlbum){
      throw Object.assign(new Error('Трек не найдён!'), { statusCode: 404 });
    }
  
    const updateFields = {};
    if (title) updateFields.title = title;
      const [numRows, updateTrack] = await Track.update(updateFields, {
        where: { id },
        returning: true
        });
        
      if (numRows === 0) {
      throw Object.assign(new Error('Не указаны поля для обновления'), { statusCode: 400 });
      }

      return updateTrack;
    }

    async delete(id) {
      const findTrack = await Track.findByPk(id);
      if(!findTrack){
        throw Object.assign(new Error('Трек не найдён!'), { statusCode: 404 });
      }
        if (fs.existsSync(findTrack.audio)) {
          fs.unlinkSync(findTrack.audio);
        }
      const deleteTrack = await Track.destroy({where: {id}});
      return deleteTrack;
      }

      async getMostListenedTracksInCurrentMonth(part) {
        const limit = 2;
        const offset = (part - 1) * limit;

        const month = new Date().getMonth() + 1;
        const startDate = new Date(new Date().getFullYear(), month - 1, 1);
        const endDate = new Date(new Date().getFullYear(), month, 0);
      
        const auditions = await Audition.findAll({
          where: {
            date_create: {
              [Op.between]: [startDate, endDate],
            },
          },
        });
      
        const auditionsByTrack = auditions.reduce((acc, audition) =>{
          const trackId = audition.TrackId;
          acc.set(trackId, (acc.get(trackId) || 0) + 1);
          return acc;
        }, new Map());
      
        const tracksByAuditions = Array.from(auditionsByTrack)
          .sort((a, b) => b[1] - a[1])
          .map((track) => track[0]);
      
          const tracks = await Track.findAll({ 
            where: Sequelize.literal(`
            EXISTS (
              SELECT 1 
              FROM Albums 
              WHERE Albums.id = Track.AlbumId AND Albums.status = 2
            )
          `),
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
            offset,
            limit  
          });
      
        return tracks;
      }


      async getMostListenedTracksInCurrentWeek(part) {
        const limit = 2;
        const offset = (part - 1) * limit;
      
        const today = new Date();

          // Get the start of the week (Monday)       
          const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

          // Get the end of the week (Sunday)
          const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6)) 

          const auditions = await Audition.findAll({
            where: {
              date_create: {
                [Op.between]: [startOfWeek, endOfWeek]  
              }
            }
          })

      
        const auditionsByTrack = auditions.reduce((acc, audition) =>{
          const trackId = audition.TrackId;
          acc.set(trackId, (acc.get(trackId) || 0) + 1);
          return acc;
        }, new Map());
      
        const tracksByAuditions = Array.from(auditionsByTrack)
          .sort((a, b) => b[1] - a[1])
          .map((track) => track[0]);
      
        const tracks = await Track.findAll({
          where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
          attributes: [
            'id',
            'title',
            'audio',
            [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id)'), 'auditions']
          ],
          where: {
            id: tracksByAuditions,
          },
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
              attributes: ['id','img'],
              include: {
                model: User,
                attributes: ['id','nickname']
              }
            }        
          ],
          order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
          offset,
          limit  
        });
      
        return (tracks);
      }

      async getTracksForAuthor(part,userId) {
        const limit = 2;
        const offset = (part - 1) * limit;
    
        const tracks = await Track.findAll({
          where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
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
              where: { UserId: userId },
              include: {
                model: User,
                where: {
                  id: userId
                },
                attributes: ['id', 'nickname'],
              }
            },
          ],
          order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
          offset,
          limit  
        });
    
        if(!tracks){
          throw Object.assign(new Error("Треков нет!"), { statusCode: 400});  
        } 
        return tracks;
      }

      async getTracksForGenre(part,genreId) {
        const limit = 2;
        const offset = (part - 1) * limit;
    
        const tracks = await Track.findAll({
          where: Sequelize.literal(`
          EXISTS (
            SELECT 1 
            FROM Albums 
            WHERE Albums.id = Track.AlbumId AND Albums.status = 2
          )
        `),
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
              },
              include: {
                model: Genre,
                attributes: ['id', 'title'],
                where: {
                  id: genreId
                },
                through: { attributes: [] }
              }
            },
          ],
          order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
          offset,
          limit  
        });
    
        if(!tracks){
          throw Object.assign(new Error("Треков нет!"), { statusCode: 400});  
        } 
        return tracks;
      }
      

      
}
module.exports = new trackService();
