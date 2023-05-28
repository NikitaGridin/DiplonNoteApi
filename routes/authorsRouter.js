const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController')

router.get("/all", authorController.all) 
router.get("/one/:id", authorController.one) 
router.get("/waitAccept", authorController.waitAccept) 

module.exports = router;
