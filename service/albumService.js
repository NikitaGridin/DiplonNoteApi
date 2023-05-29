const { Op, Sequelize } = require('@sequelize/core');
const { sequelize } = require("../db");
const { Album, AlbumGenre, Track, User, Genre, Coauthor, Audition } = require("../models/association");
const fs = require("fs");

class albumService {

  async all(part = 1) {
    const limit = 10;
    const offset = (part - 1) * limit;

    const albums = await Album.findAll({
      attributes: [
        'id',
        'title',
        'img',
        'type',
        'status',
        'UserId',
        [sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']],
        where: {status: 2},
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
        offset: offset,
        order: [[sequelize.literal('auditions'), 'DESC']]
    });
    return albums;
  }


  async one(id) {
    const album = await Album.findByPk(id,{
    attributes: [
    'id',
    'title',
    'img',
    'type',
    [sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']],
    include: [
    {
    model: Track,
    attributes: [
    'id',
    'title',
    'audio',
  ],
    },
    {
    model: Genre,
    attributes: ['id', 'title'],
    through: { attributes: [] },
    },
    {
    model: User,
    attributes: ['id', 'nickname'],
    where: { id: sequelize.col('Album.UserId') }
    }
    ],
    });

     return album;
    }
    
    async add (body, files)  {  
        const { title, type, genres, userId, coauthors,titleTrack } = body;
        // Создаем альбом
        const album = await Album.create({
          title,
          type, 
          status: 1,
          UserId:userId,
          img: files.img[0].path
        });
        
              
      // Создаем треки
      const tracks = [];
      for (let i = 0; i < files.audio.length; i++) {
        const audioPath = files.audio[i].path;
        const title = titleTrack[i];
        const track = await Track.create({ title, audio: audioPath, AlbumId: album.id });
        tracks.push(track);
      }
  
      return "Good";
    }

  async update(body, id, img) {
    const { title, type, status } = body;

    const findAlbum = await Album.findByPk(id);
    if(!findAlbum){
      throw Object.assign(new Error('Альбом не найдён!'), { statusCode: 404 });
    }
  
    const updateFields = {};
    if (title) updateFields.title = title;
    if (type) updateFields.type = type;
    if (status) updateFields.status = status;
    if (img) {
      if (fs.existsSync(`uploads/images/${findAlbum.img}`)) {
        fs.unlinkSync(`uploads/images/${findAlbum.img}`);
      }
      updateFields.img = img.filename;
    }
      const [numRows, updatedUser] = await Album.update(updateFields, {
        where: { id },
        returning: true
        });
        
      if (numRows === 0) {
      throw Object.assign(new Error('Не указаны поля для обновления'), { statusCode: 400 });
      }

      return updatedUser;
    }

    async delete(id) {
      const findAlbum = await Album.findByPk(id);
      const findTracks = await Track.findAll({where: {albumId:id}});
      if(!findAlbum){
        throw Object.assign(new Error('Альбом не найдён!'), { statusCode: 404 });
      }
      for (const track of findTracks) {
        const audioPath = `${track.audio}`;
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
      const imagePath = `uploads/images/${findAlbum.img}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      const deletedAlbum = await Album.destroy({where: {id}});

      return deletedAlbum;
      }



      async getMostListenedAlbumsInCurrentMonth(part) {
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
      
        const albums = await Album.findAll({
          attributes: [
            'id',
            'title',
            'img',
            [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']
          ],
          where: {status: 2},
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
          order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
          offset,
          limit  
        });
      
        return albums;
      }


      async getMostListenedAlbumsInCurrentWeek(part) {
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
      
          const albums = await Album.findAll({
            attributes: [
              'id',
              'title',
              'img',
              [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']
            ],
            where: {status: 2},
            include: [{
              model: Track,
              attributes: [
                'id',
                'title',
                'audio',
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
                  }  
                },     
              ],
            },
            {model: User,
              attributes: ['id','nickname']
          } 
          ],
            order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
            offset,
            limit  
          });
        
          return albums;
      }

      async getAlbumsForAuthor(part,userId) {
        const limit = 2;
        const offset = (part - 1) * limit;
    
        const albums = await Album.findAll({
          attributes: [
            'id',
            'title',
            'img',
            [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']
          ],
          where: {status: 2},
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
          {
            model: User,
            where: {
              id: userId
            },
            attributes: ['id', 'nickname'],
          } 
        ],
          order: [[Sequelize.literal('auditions DESC')]], // сортировка поубыванию количества прослушиваний
          offset,
          limit  
        });
    
        if(!albums){
          throw Object.assign(new Error("Альбомов нет!"), { statusCode: 400});  
        } 
        return albums;
      }

      async getAlbumsForGenre(part,genreId) {
        const limit = 2;
        const offset = (part - 1) * limit;
    
        const tracks = await Album.findAll({
          attributes: [
          'id',
          'title',
          'img',
          [Sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions'],
        ],
        where: {status: 2},
          include: {      

                model: Genre,
                attributes: ['id', 'title'],
                where: {
                  id: genreId
                },
                through: { attributes: [] }
              },
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
module.exports = new albumService();
