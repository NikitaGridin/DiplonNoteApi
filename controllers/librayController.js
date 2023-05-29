const librayService = require("../service/librayService");

class librayController {
  async addedTracks(req, res, next){
    const {userId} = req.params;
    try {
      const tracks = await librayService.addedTracks(userId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   } 
  async allTrack(req, res, next){
    const {part,userId} = req.params;
    try {
      const tracks = await librayService.allTrack(part,userId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   }  
   async addTrack(req, res, next){
    const {userId,trackId} = req.body;
    try {
      const track = await librayService.addTrack(userId,trackId);
      res.status(200).send('Трек успешно добавлен!');
    } catch (error) {
      next(error)
    }
   }  
   async deleteTrack(req, res, next){
    const {userId, trackId} = req.params;
    try {
      const track = await librayService.deleteTrack(userId, trackId);
      res.status(200).send("Трек удалён!");
    } catch (error) {
      next(error)
    }
   } 


   async allPlaylist(req, res, next){
    const {part,userId} = req.params;
    try {
      const allPlaylist = await librayService.allPlaylist(part,userId);
      res.status(200).send(allPlaylist);
    } catch (error) {
      next(error)
    }
   }  
   async addPlaylist(req, res, next){
    const {playlistId,userId} = req.body;
    try {
      const playlist = await librayService.addPlaylist(playlistId,userId);
      res.status(200).send('Плейлист успешно добавлен!');
    } catch (error) {
      next(error)
    }
   } 
   async deletePlaylist(req, res, next){
    const {userId, playlistId} = req.body;
    try {
      const deletePlaylist = await librayService.deletePlaylist(userId, playlistId);
      res.status(200).send("Плейлист удалён!");
    } catch (error) {
      next(error)
    }
   } 

   async addedAlbums(req, res, next){
    const {userId} = req.params;
    try {
      const tracks = await librayService.addedAlbums(userId);
      res.status(200).send(tracks);
    } catch (error) {
      next(error)
    }
   } 
   async allAlbum(req, res, next){
    const {part,userId} = req.params;
    try {
      const allAlbums = await librayService.allAlbum(part,userId);
      res.status(200).send(allAlbums);
    } catch (error) {
      next(error)
    }
   } 
   async addAlbum(req, res, next){
    const {albumId,userId} = req.body;
    try {
      const album = await librayService.addAlbum(albumId,userId);
      res.status(200).send('Альбом успешно добавлен!');
    } catch (error) {
      next(error)
    }
   } 
   async deleteAlbum(req, res, next){
    const {userId, albumId} = req.params;
    try {
      const deleteAlbum = await librayService.deleteAlbum(userId, albumId);
      res.status(200).send("Альбом удалён!");
    } catch (error) {
      next(error)
    }
   } 
}
module.exports = new librayController();
