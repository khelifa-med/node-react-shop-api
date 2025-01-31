const express = require('express');
const User = require('../Models/User');
const userRoute = express.Router();
const HttpStatusText = require('../Utils/HttpStatusTexts');
const asyncWrapper = require('../midllwers/asyncWrapper');
const AppError = require('../Utils/AppError');
const { GetAllUsers, Register, login } = require('../controllers/UserController/UserController');
const verifyToken = require('../midllwers/verifyToken');

// users Route
userRoute.route('/')
    .get(verifyToken.verifyToken, GetAllUsers)


// Login Route
userRoute.route('/login')
    .post(login)


// register
userRoute.route('/register')
    .post(Register)


module.exports = userRoute;
