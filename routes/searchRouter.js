const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController')

router.get("/search/:searchQuery", searchController.search) 

module.exports = router;
