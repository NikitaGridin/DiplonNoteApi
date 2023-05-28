const { Track, Coauthor, User, Album, LibrayTrack, Playlist, LibrayPlaylist, LibrayAlbum } = require("../models/association");
const { sequelize } = require("../db");

class librayService {
  async addedTracks(userId) {
    const addedTracks = await LibrayTrack.findAll({
      where: {UserId: userId},
      include:{
        model: Track,
        attributes: ['id']
      },
      attributes: [] // чтобы исключить поля из таблицы LibrayTrack
    }) 
    return addedTracks.map(item => item.Track.id); // возвращаем массив id
  }
  async allTrack(part = 1, userId) {
    const limit = 10;
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
          }  
        },
        {
          model: Album,       
          attributes: ['id','img'],
        },
        {
          model: LibrayTrack,
          where: {UserId:userId}
        }      
      ],    
      offset,
      limit    
    }) 
    if(!tracks){
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });  
    }
    return tracks;
  }
  async addTrack(userId,trackId) {
    const findTrack = await LibrayTrack.findOne({
       where: { UserId: userId, TrackId: trackId }  
    });
    if (findTrack) {
      throw new Error('Трек уже добавлен!');
    }
    const addTrack = await LibrayTrack.create({
      UserId: userId,
      TrackId: trackId 
    });
    return addTrack;
  }
  async deleteTrack(userId, trackId) {
    const findTrack = await LibrayTrack.findOne({
      where: { UserId: userId, TrackId: trackId }  
    });
    
    if(!findTrack){
      throw Object.assign(new Error('Трек не найдён!'), { statusCode: 404 });
    }
    const deleteTrack = await findTrack.destroy();
    return deleteTrack;  
  }

  async allPlaylist(limit = 10, part = 1, userId) {
    const offset = (part - 1) * limit;
    const tracks = await Playlist.findAll({
      attributes: ['id','title','img'],
      include: [      
        {
          model: LibrayPlaylist,
          where: {UserId:userId},
        },
        {
          model: User,
          attributes: ['id','nickname'],
        },
      ],    
      offset,
      limit    
    })
    if(!tracks){
      throw Object.assign(new Error("Треков нет!"), { statusCode: 400 });  
    }    
    return tracks;
  }
  async addPlaylist(playlistId, userId) {
    const findTrack = await LibrayPlaylist.findOne({
       where: { UserId: userId, PlaylistId: playlistId }  
    });
    if (findTrack) {
      throw new Error('Плейлист уже добавлен!');
    }
    const addPlaylist = await LibrayPlaylist.create({
      UserId: userId,
      PlaylistId: playlistId 
    });
    return addPlaylist;
  }
  async deletePlaylist(userId, playlistId) {
    const findPlaylist = await LibrayPlaylist.findOne({
      where: { UserId: userId, PlaylistId: playlistId }  
    });
    if(!findPlaylist){
      throw Object.assign(new Error('Плейлист не найдён!'), { statusCode: 404 });
    }
    const deletePlaylist = await findPlaylist.destroy();
    return deletePlaylist;  
  }

  async allAlbum(limit = 10, part = 1, userId) {
    const offset = (part - 1) * limit;
    const albums = await Album.findAll({
      attributes: [
        'id',
        'title',
        'img',
        [sequelize.literal('(SELECT COUNT(*) FROM Auditions JOIN Tracks ON Auditions.TrackId = Tracks.id WHERE Tracks.AlbumId = Album.id)'), 'auditions']
      ],
      include: [      
        {
          model: LibrayAlbum,
          where: {UserId:userId},
        },
        {
          model: User,
          attributes: ['id','nickname'],
        },
      ],    
      offset,
      limit    
    })
    if(!albums){
      throw Object.assign(new Error("Альбомов нет!"), { statusCode: 400 });  
    }    
    return albums;
  }
  async addAlbum(albumId, userId) {
    const findAlbum = await LibrayAlbum.findOne({
       where: { userId: userId, album_id: albumId }  
    });
    if (findAlbum) {
      throw new Error('Альбом уже добавлен!');
    }
    const addAlbum = await LibrayAlbum.create({
      userId: userId,
      album_id: albumId 
    });
    return addAlbum;
  }
  async deleteAlbum(userId, albumId) {
    const findAlbum = await LibrayAlbum.findOne({
      where: { UserId: userId, album_id: albumId }  
    });
    if(!findAlbum){
      throw Object.assign(new Error('Альбом не найдён!'), { statusCode: 404 });
    }
    const deleteAlbum = await findAlbum.destroy();
    return findAlbum;  
  }
}
module.exports = new librayService();
