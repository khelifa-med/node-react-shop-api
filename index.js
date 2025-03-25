require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRouter = require('./Routes/UserRoutes');
const ProductRouter = require('./Routes/ProductRoutes');
const CategoryRouter = require('./Routes/CategoryRoutes');
const OrderRouter = require('./Routes/OrderRoutes');
const PaymentRouter = require('./Routes/PaymentRoutes');
const ReviewRouter = require('./Routes/ReviewRoutes');
const HttpStatusTexts = require('./Utils/HttpStatusTexts');
const path = require('path');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 8000;
const URL = 'mongodb://localhost:27017/node_react_shop';

// Connect DB
mongoose.connect(URL)
    .then(() => console.log('DB connected successfully'))
    .catch((err) => console.error('DB connection error:', err.message));

// use cors middleware to access the api 
app.use(cors());
// Routes
app.use(express.json()); // Parse JSON bodies

// user route
app.use(`${process.env.API_BASE_URL}/users`, UserRouter);
// product route 
app.use(`${process.env.API_BASE_URL}/products`, ProductRouter);
// category route 
app.use(`${process.env.API_BASE_URL}/categories`, CategoryRouter);
// order route
app.use(`${process.env.API_BASE_URL}/orders`, OrderRouter);
// payment route
app.use(`${process.env.API_BASE_URL}/payments`, PaymentRouter);
// review route
app.use(`${process.env.API_BASE_URL}/reviews`, ReviewRouter);

// handle error 404
app.all("*", (req, res, next) => {
    return res.status(404).json({ status: HttpStatusTexts.ERROR, message: 'This resource is not available' });
});

// global error handler
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({ status: error.statusText || HttpStatusTexts.ERROR, message: error.message });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});