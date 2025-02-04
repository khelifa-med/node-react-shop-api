
const express = require('express');

const HttpStatus = require('../../Utils/HttpStatusTexts')
const AsyncWrapper = require('../../midllwers/asyncWrapper')
const AppError = require('../../Utils/AppError')
const app = express();
app.use(express.json());


const Product = require('../../Models/Products');

const GetAllProducts = AsyncWrapper(async (req, res) => {

    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit

    const products = await Product.find({}).limit(limit).skip(skip);
    res.json({ status: HttpStatus.SUCCESS, data: { products } });
});




const GetOneProduct = AsyncWrapper(
    async (req, res, next) => {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            const error = AppError.create('product not found', 404, HttpStatus.FAIL);
            return next(error);
        }
        res.status(200).json({ status: HttpStatus.SUCCESS, data: { product } })

    }
)

const AddProduct = AsyncWrapper(async (req, res) => {
    const newProduct = new Product(req.body); // Use the imported Product model
    const savedProduct = await newProduct.save(); // Use a different variable name (e.g., savedProduct)
    res.status(201).json({ status: HttpStatus.SUCCESS, data: { product: savedProduct } }); // Send the saved product
});

const UpdateOneProduct = AsyncWrapper(async (req, res, next) => {
    const productId = req.params.id;

    const updateProduct = await Product.updateOne({ _id: productId }, { $set: { ...req.body } });
    return res.status(200).json({
        status: HttpStatus.SUCCESS,
        data: { updateProduct }
    });


});

const DeleteProduct = async (req, res, next) => {
    const productId = req.params.id;


    const deleteResult = await Product.deleteOne({ _id: productId });

    // Check if a book was actually deleted
    if (deleteResult.deletedCount === 0) {
        const error = AppError.create('product not found', 404, HttpStatus.FAIL);
        return next(error);
    }
    return res.status(200).json({
        status: HttpStatus.SUCCESS,
        data: null
    });

}
//

module.exports = {
    GetAllProducts,
    GetOneProduct,
    AddProduct,
    UpdateOneProduct,
    DeleteProduct,
}