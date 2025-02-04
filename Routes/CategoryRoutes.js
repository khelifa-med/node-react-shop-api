const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getOneCategory,
    addCategory,
    updateOneCategory,
    deleteCategory,
} = require('../controllers/CategoryController/CategoryController'); // Path to your category controller
const userRules = require('../Utils/userRules'); // Path to your user rules (if needed for authorization)
const { verifyToken } = require('../midllwers/verifyToken'); // Path to your verify token middleware
const allowedTo = require('../midllwers/allowedTo'); // Path to your allowedTo middleware

router.route('/')
    .get(getAllCategories)
    .post(addCategory);

router.route('/:id')
    .get(getOneCategory)
    .patch(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), updateOneCategory) // Example authorization
    .delete(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), deleteCategory); // Example authorization

module.exports = router;