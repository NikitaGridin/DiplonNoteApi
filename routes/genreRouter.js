const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController')


const { imageUpload } = require('../middleware/multerStorage');

router.get("/all", genreController.all) 
router.get("/one/:id", genreController.one) 
router.post("/add", imageUpload.single('img'), genreController.add) 
router.put("/update/:id",  imageUpload.single('img'),genreController.update) 
router.delete("/delete/:id", genreController.delete) 

module.exports = router;
