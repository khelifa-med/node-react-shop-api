const axios = require('axios');
const AppError = require("../Utils/AppError");
const HttpStatusTexts = require("../Utils/HttpStatusTexts");
const Order = require('../Models/Order');



async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })

    return response.data.access_token
}

const createPaypalOrder = async (req, order) => {
    try {
        const accessToken = await generateAccessToken(); // Get PayPal access token

        if (!order || !order.orderItems) {
            throw new Error("Invalid order: Order or order items are missing.");
        }

        const purchaseUnits = order.orderItems.map((item, index) => {
            const itemTotal = (item.quantity * item.price).toFixed(2); // Ensure 2 decimal places

            return {
                reference_id: `item-${index}`,
                items: [
                    {
                        name: item.name,
                        description: item.name,
                        quantity: item.quantity.toString(),
                        unit_amount: {
                            currency_code: 'USD',
                            value: item.price.toFixed(2),
                        },
                    },
                ],
                amount: {
                    currency_code: 'USD',
                    value: itemTotal,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: itemTotal,
                        },
                    },
                },
            };
        });

        const response = await axios.post(
            `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: purchaseUnits,
                application_context: {
                    return_url: `${process.env.BASE_URL}${process.env.API_BASE_URL}/payments/${order._id}/success`,
                    cancel_url: `${process.env.BASE_URL}${process.env.API_BASE_URL}/payments/${order._id}/cancel`,
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    brand_name: 'manfra.io',
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const paypalOrderId = response.data.id;

        // Save PayPal order ID in DB (make sure savePaypalOrderIdToDatabase is correctly implemented)
        await savePaypalOrderIdToDatabase(order._id, paypalOrderId);

        const approvalLink = response.data.links.find(link => link.rel === 'approve')?.href;
        if (!approvalLink) {
            throw new Error("Approval link not found in PayPal response.");
        }

        return approvalLink; // Redirect user to PayPal for payment
    } catch (error) {
        console.error('Error creating PayPal order:', error.message);
        throw error;
    }
};


async function savePaypalOrderIdToDatabase(orderId, paypalOrderId) {
    try {
        await Order.findByIdAndUpdate(orderId, { paypalOrderId: paypalOrderId });
    } catch (error) {
        console.error("Error saving PayPal order ID:", error);
        throw error;
    }
}

const capturePayment = async (paypalOrderId, payerID) => {
    const accessToken = await generateAccessToken();

    console.log('capturePayment - paypalOrderId:', paypalOrderId);
    console.log('capturePayment - payerID:', payerID);

    try {
        // Check the order status
        const orderDetails = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('capturePayment - PayPal Order Details:', orderDetails.data);

        if (orderDetails.data.status === 'COMPLETED') {
            console.log('capturePayment - Payment already captured.');
            return {
                status: 'success',
                message: 'Payment has already been captured for this order.',
                paymentDetails: orderDetails.data,
            };
        }

        // Proceed to capture the payment
        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            data: {
                payer_id: payerID,
            },
        });

        console.log('capturePayment - PayPal API response:', response.data);
        return {
            status: 'success',
            message: 'Payment captured successfully.',
            paymentDetails: response.data,
        };
    } catch (error) {
        console.error('capturePayment - PayPal Capture Error:', error);
        if (error.response) {
            console.error('capturePayment - PayPal API error response data:', error.response.data);
        }
        throw error;
    }
};

module.exports = { createPaypalOrder, capturePayment }