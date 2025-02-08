const jwt = require('jsonwebtoken');
const AppError = require('../Utils/AppError');
const HttpStatusTexts = require('../Utils/HttpStatusTexts');
const User = require('../Models/User');
const asyncWrapper = require('./asyncWrapper');

module.exports = {
    verifyToken: asyncWrapper(async (req, res, next) => {

        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        // Check if the Authorization header exists
        if (!authHeader) {
            const error = AppError.create('No token provided', 500, HttpStatusTexts.ERROR);
            return next(error);

        }
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(AppError.create('User not found', 404, HttpStatusTexts.FAIL));
            }

            req.user = user; 
            next();

        } catch (err) {
            return next(AppError.create('Invalid or expired token', 401, HttpStatusTexts.FAIL));
        }

    })
}