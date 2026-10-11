const express = require('express');
const router = express.Router();
const hotelController = require('../modules/hotel/hotel.controller');

router.get('/', hotelController.listHotels);
router.get('/compare', hotelController.compareHotels);

module.exports = router;
