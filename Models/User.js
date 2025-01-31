const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const userRules = require('../Utils/userRules');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'feild must be a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  token: {
    type: String
  },
  role: {
    type: String,
    enum: [userRules.USER, userRules.ADMIN, userRules.MANAGER],
    default: userRules.USER,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// validate password match or not

userSchema.methods.matchPassWord = async function (enterPassword) {

  return await bcrypt.compare(enterPassword, this.password)
}

// Hash the password before saving the user document || register 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10); // Generate a strong salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);