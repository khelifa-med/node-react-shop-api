const Category = require('../../Models/Category'); // Path to your Category model
const HttpStatus = require('../../Utils/HttpStatusTexts'); // Path to your HttpStatusTexts
const AsyncWrapper = require('../../midllwers/asyncWrapper'); // Path to your async wrapper
const AppError = require('../../Utils/AppError'); // Path to your AppError class

const getAllCategories = AsyncWrapper(async (req, res) => {
    const categories = await Category.find({}); // Retrieve all categories
    res.json({ status: HttpStatus.SUCCESS, data: { categories } });
});

const getOneCategory = AsyncWrapper(async (req, res, next) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
        const error = AppError.create('Category not found', 404, HttpStatus.FAIL);
        return next(error);
    }

    res.status(200).json({ status: HttpStatus.SUCCESS, data: { category } });
});

const addCategory = AsyncWrapper(async (req, res) => {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json({ status: HttpStatus.SUCCESS, data: { category: savedCategory } });
});

const updateOneCategory = AsyncWrapper(async (req, res, next) => {
    const categoryId = req.params.id;
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true, runValidators: true }); // new: true to get the updated object

    if (!updatedCategory) {
        const error = AppError.create('Category not found', 404, HttpStatus.FAIL);
        return next(error);
    }

    res.status(200).json({ status: HttpStatus.SUCCESS, data: { category: updatedCategory } });
});


const deleteCategory = AsyncWrapper(async (req, res, next) => {
    const categoryId = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
        const error = AppError.create('Category not found', 404, HttpStatus.FAIL);
        return next(error);
    }

    res.status(200).json({ status: HttpStatus.SUCCESS, data: null });
});

module.exports = {
    getAllCategories,
    getOneCategory,
    addCategory,
    updateOneCategory,
    deleteCategory,
};