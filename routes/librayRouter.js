const express = require('express');
const router = express.Router();
const librayController = require('../controllers/librayController')

router.get("/addedTracks/:userId", librayController.addedTracks) 
router.get("/allTrack/:part/:userId", librayController.allTrack) 
router.post("/addTrack", librayController.addTrack) 
router.delete("/deleteTrack/:userId/:trackId", librayController.deleteTrack) 

router.get("/allPlaylist", librayController.allPlaylist) 
router.post("/addPlaylist", librayController.addPlaylist) 
router.delete("/deletePlaylist", librayController.deletePlaylist) 

router.get("/allAlbum", librayController.allAlbum) 
router.post("/addAlbum", librayController.addAlbum) 
router.delete("/deleteAlbum", librayController.deleteAlbum) 
module.exports = router;
