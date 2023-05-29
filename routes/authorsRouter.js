const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController')

router.get("/all/:part", authorController.all) 
router.get("/one/:id", authorController.one) 
router.get("/waitAccept/:part/:id", authorController.waitAccept) 

module.exports = router;
