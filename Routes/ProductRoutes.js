const express = require('express');
const router = express.Router()
const { GetAllProducts, GetOneProduct, AddProduct, UpdateOneProduct, DeleteProduct } = require('../controllers/ProductsController/ProductController');
const userRules = require('../Utils/userRules');
const { verifyToken } = require('../midllwers/verifyToken');
const allowedTo = require('../midllwers/allowedTo');

// Define your routes here
router.route('/')
    .get(GetAllProducts)
    .post(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), AddProduct)

router.route('/:id')
    .get(GetOneProduct)
    .patch(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), UpdateOneProduct)
    .delete(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), DeleteProduct)

module.exports = router;