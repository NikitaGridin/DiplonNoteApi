const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

const { imageUpload, upload } = require("../middleware/multerStorage");

router.get("/all/:part", albumController.all);
router.get("/one/:id", albumController.one);
router.post("/add", upload.any(), albumController.add);
router.put("/update/:id", imageUpload.single("img"), albumController.update);
router.delete("/delete/:id", albumController.delete);

router.get(
  "/mostListenedAlbumsInCurrentMonth/:part",
  albumController.mostListenedAlbumsInCurrentMonth
);
router.get("/albumsForAuthor/:part/:userId", albumController.albumsForAuthor);
router.get("/albumsForGenre/:part/:genreId", albumController.albumsForGenre);

module.exports = router;
