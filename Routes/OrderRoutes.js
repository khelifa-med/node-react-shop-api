// Corrected orderRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOneOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    handlePayPalSuccess,
    handlePayPalCancel,
} = require('../controllers/OrderController/OrderController'); // Ensure path is correct
const { verifyToken } = require('../midllwers/verifyToken');
const allowedTo = require('../midllwers/allowedTo');
const userRules = require('../Utils/userRules');

// Order routes
router.route('/')
    .get(getAllOrders) // No auth needed for get all orders
    .post(verifyToken, createOrder); // Authentication required to create an order

router.route('/:id')
    .get(getOneOrder) // No auth needed for get one order
    .patch(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), updateOrder) // Admin/Manager only
    .delete(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), deleteOrder); // Admin/Manager only



module.exports = router;
