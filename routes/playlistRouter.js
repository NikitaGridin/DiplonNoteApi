const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistController");

const { imageUpload } = require("../middleware/multerStorage");

router.get("/all/:part", playlistController.all);
router.get("/one/:id", playlistController.one);
router.post("/add", imageUpload.single("img"), playlistController.add);
router.put("/update/:id", imageUpload.single("img"), playlistController.update);
router.delete("/delete/:id", playlistController.delete);

module.exports = router;
