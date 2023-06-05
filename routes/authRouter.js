const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { imageUpload } = require("../middleware/multerStorage");

router.post("/sign-in", imageUpload.single("img"), authController.signIn); //create user with profile image
router.post("/log-in", authController.logIn); //login
router.post("/logout", authController.logout); //logout
router.post("/activate/", authController.activate); //activate
router.get("/refresh", authController.refresh); //refresh

module.exports = router;
