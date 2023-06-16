const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { imageUpload } = require("../middleware/multerStorage");

router.get("/all", userController.all); //get all users
router.get("/one/:id", userController.one); //get one user by id
router.put("/update/:id", imageUpload.single("img"), userController.update);
router.delete("/delete/:id", userController.delete); //delete user by id

module.exports = router;
