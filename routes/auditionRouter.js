const express = require('express');
const router = express.Router();
const auditionController = require('../controllers/auditionController')

router.post("/add", auditionController.add) 

module.exports = router;
