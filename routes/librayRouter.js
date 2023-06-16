const express = require("express");
const router = express.Router();
const librayController = require("../controllers/librayController");

router.get("/addedTracks/:userId", librayController.addedTracks);
router.get("/allTrack/:part/:userId", librayController.allTrack);
router.post("/addTrack/:userId/:trackId", librayController.addTrack);
router.delete("/deleteTrack/:userId/:trackId", librayController.deleteTrack);

router.get("/addedPlaylist/:userId", librayController.addedPlaylist);
router.get("/allPlaylist/:part/:userId", librayController.allPlaylist);
router.post("/addPlaylist/:userId/:playlistId", librayController.addPlaylist);
router.delete(
  "/deletePlaylist/:userId/:playlistId",
  librayController.deletePlaylist
);

router.get("/addedAlbums/:userId", librayController.addedAlbums);
router.get("/allAlbum/:part/:userId", librayController.allAlbum);
router.post("/addAlbum/:userId/:albumId", librayController.addAlbum);
router.delete("/deleteAlbum/:userId/:albumId", librayController.deleteAlbum);
module.exports = router;
