const express = require('express');
const User = require('../../Models/User');
const HttpStatusText = require('../../Utils/HttpStatusTexts');
const asyncWrapper = require("../../midllwers/asyncWrapper");
const AppError = require('../../Utils/AppError');
const GenerateJwt = require('../../Utils/GenerateJwt')

// Get All Users
const GetAllUsers = asyncWrapper(async (req, res) => {

    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit

    const users = await User.find({}, { "__v": false, "password": false }).limit(limit).skip(skip);
    res.json({ status: HttpStatusText.SUCCESS, data: { users } });
});


// register

const Register = asyncWrapper(
    async (req, res, next) => {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = AppError.create('User already exists', 400, HttpStatusText.FAIL);
            return next(error); // Use return to stop further execution
        }

        // Create and save the user, including isAdmin
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            avatar: req.file.filename
        });

        // generate jwt token
        const token = await GenerateJwt({ email: newUser.email, id: newUser._id, role: newUser.role });
        newUser.token = token;

        // Send user data, including isAdmin from the newly created user
        await newUser.save()
        res.status(201).json({ status: HttpStatusText.SUCCESS, data: { user: newUser } })
    }
);


// login

const login = asyncWrapper(
    async (req, res, next) => {
        const { email, password } = req.body;

        // Check for existing user
        const user = await User.findOne({ email });
        if (!user) {
            const error = AppError.create('Invalid email or password', 401, HttpStatusText.FAIL);
            return next(error)
        }

        // Compare hashed passwords
        const isMatch = await user.matchPassWord(password);
        if (!isMatch) {
            const error = AppError.create('Invalid email or password', 401, HttpStatusText.FAIL);
            return next(error)
        }

        // Send user data 
        const token = await GenerateJwt({ email: user.email, id: user._id, role: user.role })
        res.status(200).json({
            status: HttpStatusText.SUCCESS,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token
            },

        });
    }
)




module.exports = {
    GetAllUsers,
    Register,
    login
}