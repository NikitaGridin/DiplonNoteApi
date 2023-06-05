const express = require("express");
const router = express.Router();
const trackController = require("../controllers/trackController");

router.get("/all/:part", trackController.all);
router.get("/one/:id", trackController.one);
router.put("/update/:id", trackController.update);
router.delete("/delete/:id", trackController.delete);

router.get(
  "/mostListenedTracksInCurrentMonth/:part",
  trackController.mostListenedTracksInCurrentMonth
);
router.get("/tracksForAuthor/:part/:userId", trackController.tracksForAuthor);
router.get(
  "/tracksForCoauthor/:part/:userId",
  trackController.tracksForCoauthor
);
router.get("/tracksForGenre/:part/:genreId", trackController.tracksForGenre);
router.get("/latest/:part/:userId", trackController.latest);

module.exports = router;
