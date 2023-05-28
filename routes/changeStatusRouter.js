const express = require('express');
const router = express.Router();
const changeStatusController = require('../controllers/changeStatusController')

router.put("/application", changeStatusController.application) 
router.put("/track", changeStatusController.track) 

module.exports = router;
