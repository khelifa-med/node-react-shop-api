const Order = require('../../Models/Order');
const Product = require('../../Models/Products');
const HttpStatus = require('../../Utils/HttpStatusTexts');
const AsyncWrapper = require('../../midllwers/asyncWrapper');
const AppError = require('../../Utils/AppError');
const { createPaypalOrder } = require('../../Service/Paypal'); // Import PayPal functions

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


// create newOrder nad integrate the paypal connection api with the order created 

const createOrder = AsyncWrapper(async (req, res, next) => {
    const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice, price } = req.body;

    // 1. Validate order items and update stock (same as before)
    const validatedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw AppError.create(`Product ${item.product} not found`, 400, HttpStatus.FAIL);
            }
            if (product.countInStock < item.quantity) {
                throw AppError.create(`${product.name} is out of stock`, 400, HttpStatus.FAIL);
            }

            await Product.findByIdAndUpdate(product._id, { $inc: { countInStock: -item.quantity } });

            return {
                ...item,
                name: product.name,
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
        price
    });

    try {
        const savedOrder = await newOrder.save();
        const retrievedOrder = await Order.findById(savedOrder._id); // Fetch the order AGAIN
        if (!retrievedOrder) {
            return next(AppError.create('Order not found after saving.', 500, HttpStatus.FAIL));
        }

        // 2. Handle PayPal payment if paymentMethod is PayPal
        if (paymentMethod === 'PayPal') {
            try {
                const approvalUrl = await createPaypalOrder(req, retrievedOrder); // Pass the test object
                return res.json({ approvalUrl }); // Send approval URL to the client
            } catch (paypalError) {
                // Handle PayPal error (log, revert stock, delete order, send error to client)
                console.error("PayPal Error:", paypalError);
                if (paypalError.response && paypalError.response.data) {
                    const paypalErrorDetails = paypalError.response.data;
                    console.error("PayPal Error Details:", paypalErrorDetails); // Log the full object
                    // ...
                }
                // Revert Stock Changes (Crucial!)
                for (const item of validatedOrderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.quantity } });
                    }
                }
                await Order.findByIdAndDelete(savedOrder._id); // Delete the order

                return next(paypalError); // Pass the AppError to your error handler
            }
        }

        // 3. If not PayPal, or PayPal order creation was successful (but payment not yet captured), complete the order:
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
        next(error); // Handle other errors (database, validation, etc.)
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