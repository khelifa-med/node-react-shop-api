const express = require('express');
const router = express.Router();

const User = require('./Models/User');
const users = require('./data/UserData');


const Product = require('./Models/Products');
const products = require('./data/ProductData');

const asyncHandler = require('express-async-handler')
// Seed Users
router.post('/users', asyncHandler(
    async (req, res) => {
        try {
            await User.deleteMany({});
            const userSeeder = await User.insertMany(users);
            res.status(201).send({ userSeeder });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
));


// Seed Products
router.post('/products', asyncHandler(
    async (req, res) => {
        try {
            await Product.deleteMany({});
            const productsSeeder = await Product.insertMany(products);
            res.status(201).send({ productsSeeder });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
));

module.exports = router;
