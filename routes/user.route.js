const express = require('express');
const router = express.Router(); 
const authenticateToken = require('../middleware/authenticateToken');
const userController = require("../modules/user/user.controller");
const { userGetLimiter } = require('../middleware/rateLimt');

router.use(authenticateToken);

 /** give total credit and dibit transtion to a user with name and userId */
router.get('/', userGetLimiter, userController.getUser);
router.get('/:id', userController.getUserById);
//* Get all users with their total credit and dibit transtion  aand with report.json file with name and userId and totalCredit and totalDebit
router.post('/create', userController.createUser);
 
 
module.exports = router;