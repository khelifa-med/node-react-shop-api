const express = require('express');
const userRoute = express.Router();
const multer = require('multer')
const AppError = require('../Utils/AppError');
const { Register, login } = require('../controllers/UserController/UserAuth');
const verifyToken = require('../midllwers/verifyToken');
const { GetAllUsers, GetOneUser, DeleteOneUser } = require('../controllers/UserController/AcountManagement');




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file);
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const uniqueSuffix = `user-${Date.now()}.${ext}`
        cb(null, uniqueSuffix)
    }
})


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // More robust image check
        cb(null, true);
    } else {
        cb(AppError.create('File must be an image', 400), false); // Pass error to next()
    }
};

const upload = multer(
    {
        storage,
        fileFilter
    }
)




// users Routes management//
userRoute.route('/')
    .get(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), GetAllUsers)


userRoute.route('/:id')
    .get(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), GetOneUser)
    .delete(verifyToken, allowedTo(userRules.ADMIN, userRules.MANAGER), DeleteOneUser)

// users Routes management//    

// Login Route
userRoute.route('/login')
    .post(login)


// register
userRoute.route('/register')
    .post(upload.single('avatar'), Register)


module.exports = userRoute;
