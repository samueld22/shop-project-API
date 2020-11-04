const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: true,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (el) {
        //The this keyword only points to the current doc on NEW document creation
        return el === this.password;
      },
      message: 'Password must be the same in both fields!',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  shoppingLists: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //Check if password has been modified
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //Check if password has been changed
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //Return the conditional boolean
    return JWTTimestamp < changedTimestamp;
  }

  //If no change in password
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
