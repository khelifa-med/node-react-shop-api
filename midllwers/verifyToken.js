const jwt = require('jsonwebtoken');
const AppError = require('../Utils/AppError');
const HttpStatusTexts = require('../Utils/HttpStatusTexts');

module.exports = {
    verifyToken: (req, res, next) => {

        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        // Check if the Authorization header exists
        if (!authHeader) {
            const error = AppError.create('No token provided', 500, HttpStatusTexts.ERROR);
            return next(error);

        }
        const token = authHeader.split(' ')[1];


        try {
            // Verify the token
            const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.currentUser = currentUser;
            next();
        } catch (err) {
            // If token verification fails, return an error
            const error = AppError.create('Invalid or expired token', 401, HttpStatusTexts.FAIL);
            return next(error);
        }

    }
}