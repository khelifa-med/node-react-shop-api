const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOneOrder,
    createOrder,
    updateOrder,
    deleteOrder,
} = require('../controllers/OrderController/OrderController'); // Correct path
const { verifyToken } = require('../midllwers/verifyToken');
const allowedTo = require('../midllwers/allowedTo');
const userRules = require('../Utils/userRules');



router.route('/')
    .get(getAllOrders) // No auth needed for get all products
    .post(verifyToken, createOrder); // Authentication required to create an order

router.route('/:id')
    .get(getOneOrder) // No auth needed for get one product
    .patch(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), updateOrder) // Admin/Manager only
    .delete(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), deleteOrder); // Admin/Manager only



module.exports = router;