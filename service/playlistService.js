const { sequelize } = require("../db");
const { Playlist, AlbumGenre, Track, Album, Coauthor, User } = require("../models/association");
const fs = require("fs");

class playlistService {

  async all(limit = 4, part = 1, userId) {
    const offset = (part - 1) * limit;
    const playlists = await Playlist.findAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN PlaylistsTracks ON Auditions.TrackId = PlaylistsTracks.TrackId WHERE PlaylistsTracks.PlaylistId = Playlists.id)'), 'auditions']
        ],
      },
      include: {
        model: User,
        where: {id:userId},
        attributes: ['id','nickname']
      },
      limit: limit,
      offset: offset
    });
  
    return playlists;
  }

  async one(id) {  
    const playlist = await Playlist.findByPk(id,{
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN PlaylistsTracks ON Auditions.TrackId = PlaylistsTracks.TrackId WHERE PlaylistsTracks.PlaylistId = Playlists.id)'), 'auditions']
        ],
      },
      include: [
        {
          model: Track,
          through: { attributes: [] },
          attributes: ['id','title','audio'],
          include:[
            {
              model: Coauthor,
              as: "CoauthorAlias",
            },
            {
              model: Album,
              attributes: ['id', 'img']
            }
          ]
        }
      ]
    })
    if(!playlist){
      throw Object.assign(new Error("Плейлист не найден!"), { statusCode: 400 });
    }
    
    return playlist;
  }
  
  async add(body, file) {
    const {title,userId} = body;
    
    if(!title ||  !userId || !file){
      throw Object.assign(new Error("Пожалуйста, заполните все поля!"), { statusCode: 400 });
    }

    const newPlaylist = await Playlist.create({
      title:title,
      img: file.filename,
      UserId: userId,
    });
    
    return newPlaylist;

  }

  async update(body, id, img) {
    const { title } = body;

    const findPlaylist = await Playlist.findByPk(id);
    if(!findPlaylist){
      throw Object.assign(new Error('Плейлист не найдён!'), { statusCode: 404 });
    }
  
    const updateFields = {};
    if (title) updateFields.title = title;
    if (img) {
      if (fs.existsSync(`uploads/images/${findPlaylist.img}`)) {
        fs.unlinkSync(`uploads/images/${findPlaylist.img}`);
      }
      updateFields.img = img.filename;
    }
      const [numRows, updatedPlaylist] = await Playlist.update(updateFields, {
        where: { id },
        returning: true
        });
        
      if (numRows === 0) {
      throw Object.assign(new Error('Не указаны поля для обновления'), { statusCode: 400 });
      }

      return updatedPlaylist;
    }

    async delete(id) {
      const findPlaylist = await Playlist.findByPk(id);
      if(!findPlaylist){
        throw Object.assign(new Error('Плейлист не найдён!'), { statusCode: 404 });
      }
      const imagePath = `uploads/images/${findPlaylist.img}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      const deleteTrack = await findPlaylist.destroy();

      return deleteTrack;
      }

}
module.exports = new playlistService();
