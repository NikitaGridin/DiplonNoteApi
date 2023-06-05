const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");

router.get("/allFriends/:id", connectionController.allFriends);
router.get("/allFolowers", connectionController.allFolowers);
router.get("/allFolowing", connectionController.allFolowing);
router.get("/checkSubscribe", connectionController.checkSubscribe);
router.post("/changeSubscribe", connectionController.changeSubscribe);

module.exports = router;
