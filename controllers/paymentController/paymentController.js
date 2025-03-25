const Order = require('../../Models/Order');
const Product = require('../../Models/Products');
const AppError = require('../../Utils/AppError');
const HttpStatus = require('../../Utils/HttpStatusTexts');
const { capturePayment } = require('../../Service/Paypal'); // Import capturePayment function
const AsyncWrapper = require('../../midllwers/asyncWrapper');

const handlePayPalSuccess = AsyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;
    const token = req.query.token || req.query.Token; // Handle possible case variations
    const PayerID = req.query.PayerID;

    if (!token || !PayerID) {
        return next(AppError.create('Missing token or PayerID in PayPal response', 400, HttpStatus.FAIL));
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
        }

        const paymentDetails = await capturePayment(token, PayerID);

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentMethod = 'PayPal';
        order.paymentResult = paymentDetails;

        const updatedOrder = await order.save();

        res.status(200).json({
            status: HttpStatus.SUCCESS,
            message: 'Payment successful',
            order: updatedOrder,
        });
    } catch (error) {
        next(error);
    }
});

const handlePayPalCancel = AsyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
        }

        // Revert stock changes
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.quantity } });
            }
        }

        await Order.findByIdAndDelete(orderId); // Remove cancelled order

        res.status(200).json({ status: HttpStatus.SUCCESS, message: 'Payment cancelled' });
    } catch (error) {
        next(error);
    }
});

const handlePaymentCapture = AsyncWrapper(async (req, res, next) => {
    const { orderId } = req.params;
    const { token, payerId } = req.body;

    console.log('handlePaymentCapture - orderId:', orderId);
    console.log('handlePaymentCapture - token:', token);
    console.log('handlePaymentCapture - payerId:', payerId);

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            console.log('handlePaymentCapture - Order not found');
            return next(AppError.create('Order not found', 404, HttpStatus.FAIL));
        }

        console.log('handlePaymentCapture - Order found:', order);

        // Capture the payment
        const paymentResponse = await capturePayment(token, payerId);

        console.log('handlePaymentCapture - paymentResponse:', paymentResponse);

        if (paymentResponse.status === 'success' && paymentResponse.message === 'Payment has already been captured for this order.') {
            return res.status(200).json({
                status: 'success',
                message: paymentResponse.message,
                paymentDetails: paymentResponse.paymentDetails,
            });
        }

        // Update the order with payment details
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentMethod = 'PayPal';
        order.paymentResult = paymentResponse.paymentDetails;

        console.log('handlePaymentCapture - Order before save:', order);

        await order.save();

        console.log('handlePaymentCapture - Order saved successfully');

        res.status(200).json({
            status: 'success',
            message: 'Payment captured successfully.',
            order,
        });
    } catch (error) {
        console.error('handlePaymentCapture - Error:', error);
        next(error);
    }
});
module.exports = { handlePayPalSuccess, handlePayPalCancel, handlePaymentCapture };