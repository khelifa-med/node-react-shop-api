const Order = require('../../Models/Order');
const Product = require('../../Models/Products');
const HttpStatus = require('../../Utils/HttpStatusTexts');
const AsyncWrapper = require('../../midllwers/asyncWrapper');
const AppError = require('../../Utils/AppError');

const getAllOrders = AsyncWrapper(async (req, res) => {
    const orders = await Order.find({}).populate('user', '-password').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
        },
    });
    res.json({ status: HttpStatus.SUCCESS, data: { orders } });
});

const getOneOrder = AsyncWrapper(async (req, res, next) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('user', '-password').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
        },
    });

    if (!order) {
        return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
    }
    res.status(200).json({ status: HttpStatus.SUCCESS, data: { order } });
});

const createOrder = AsyncWrapper(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice } = req.body;

    // Validate order items: Check if the products exist and update stock
    const validatedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw AppError.create(`Product ${item.product} not found`, 400, HttpStatus.FAIL);
            }
            if (product.countInStock < item.quantity) {
                throw AppError.create(`${product.name} is out of stock`, 400, HttpStatus.FAIL);
            }

            // Update product stock
            await Product.findByIdAndUpdate(product._id, { $inc: { countInStock: -item.quantity } });

            return {
                ...item,
                name: product.name,
                // image: product.image,
                price: product.price,
            };
        })
    );

    const newOrder = new Order({
        user: req.user._id,
        orderItems: validatedOrderItems,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    try {
        const savedOrder = await newOrder.save();

        // Populate the order data before sending the response (important!)
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('user', '-password')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                },
            });

        res.status(201).json({ status: HttpStatus.SUCCESS, data: { order: populatedOrder } });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
});

const updateOrder = AsyncWrapper(async (req, res, next) => {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true, runValidators: true }).populate('user', '-password').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
        },
    });

    if (!updatedOrder) {
        return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
    }
    res.status(200).json({ status: HttpStatus.SUCCESS, data: { order: updatedOrder } });
});

const deleteOrder = AsyncWrapper(async (req, res, next) => {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
        return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
    }
    res.status(200).json({ status: HttpStatus.SUCCESS, data: null });
});

module.exports = {
    getAllOrders,
    getOneOrder,
    createOrder,
    updateOrder,
    deleteOrder,
};