const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");

const { imageUpload } = require("../middleware/multerStorage");

router.get("/all/:part", genreController.all);
router.get("/one/:id", genreController.one);
router.post("/add", imageUpload.single("img"), genreController.add);
router.put("/update/:id", imageUpload.single("img"), genreController.update);
router.delete("/delete/:id", genreController.delete);

router.get(
  "/mostListenedGenresInCurrentMonth/:part",
  genreController.mostListenedGenresInCurrentMonth
);

module.exports = router;
