const express = require('express');
const { handlePayPalSuccess, handlePayPalCancel, handlePaymentCapture } = require('../controllers/paymentController/paymentController');
const router = express.Router();

router.get('/:orderId/success', handlePayPalSuccess);
router.get('/:orderId/cancel', handlePayPalCancel);
router.post('/:orderId/capture', handlePaymentCapture);

module.exports = router;