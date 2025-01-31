const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const databaseSeeder = require('./dataBaseSlider');
const userRoute = require('./Routes/UserRoutes');
const ProductRouter = require('./Routes/ProductRoutes')
const HttpStatusTexts = require('./Utils/HttpStatusTexts');
dotenv.config();

const app = express();


const PORT = process.env.PORT || 8000;
const URL = 'mongodb://localhost:27017/node_react_shop'

// Connect DB
mongoose.connect(URL)
    .then(() => console.log('DB connected successfully'))
    .catch((err) => console.error('DB connection error:', err.message));


// use cors midllware to access the api 
app.use(cors());
// Routes
app.use(express.json()); // Parse JSON bodies
// data base route
app.use('/api/E_Shop', databaseSeeder);
// user route
app.use('/api/E_Shop/users', userRoute);
// product route 
app.use('/api/E_Shop/products', ProductRouter);



// hendel error 404
app.all("*", (req, res, next) => {
    return res.status(404).json({ status: HttpStatusTexts.ERROR, message: 'This reccourse is not available' });

})

//global error handeler
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({ status: error.statusText || HttpStatusTexts.ERROR, message: error.message })
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
