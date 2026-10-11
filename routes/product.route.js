const express = require('express');
const router = express.Router(); 
const authenticateToken = require('../middleware/authenticateToken');
const productController = require("../modules/product/product.controller");
const { productGetLimiter } = require('../middleware/rateLimt');


router.use(authenticateToken);

 /** give total credit and dibit transtion to a user with name and userId */
router.get('/',productGetLimiter, productController.getProducts);
router.get('/:id',productGetLimiter, productController.getById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
 
 
module.exports = router;