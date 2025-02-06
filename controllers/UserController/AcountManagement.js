const User = require('../../Models/User');
const HttpStatusText = require('../../Utils/HttpStatusTexts');
const asyncWrapper = require("../../midllwers/asyncWrapper");
const AppError = require('../../Utils/AppError');

// Get All Users
const GetAllUsers = asyncWrapper(async (req, res) => {

    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit

    const users = await User.find({}, { "__v": false, "password": false }).limit(limit).skip(skip);
    res.json({ status: HttpStatusText.SUCCESS, data: { users } });
});

const GetOneUser = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            const error = AppError.create('User not found', 404, HttpStatusText.FAIL); 
            return next(error); 
        }
        res.status(200).json({ status: HttpStatusText.SUCCESS, data: { user } })

    }
)


// Delete One User
const DeleteOneUser = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.id;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            const error = AppError.create('User not found', 404, HttpStatusText.FAIL);
            return next(error);
        }

        res.status(200).json({ 
            status: HttpStatusText.SUCCESS, 
            message: 'User deleted successfully' 
        });
    }
)

// Export the functions
module.exports = {
    GetAllUsers,
    GetOneUser,
    DeleteOneUser
};