const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const respond = require('../utils/respond');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  users = await factory.getAll(User);
  respond(res, users);
});

exports.createUser = catchAsync(async (req, res, next) => {
  user = await factory.createOne(User, req.body);
  respond(res, user);
});

exports.getUser = catchAsync(async (req, res, next) => {
  user = await factory.getOne(User, req.params.userId);
  //Check whether user exists
  validateUser(user);
  respond(res, user);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  originalUser = await factory.getOne(User, req.params.userId);
  //Check whether user exists
  validateUser(originalUser);
  factory.deleteOne(User, originalUser._id);
  respond(res);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  originalUser = await factory.getOne(User, req.params.userId);
  //Check whether user exists
  validateUser(originalUser);
  updatedUser = await factory.updateOne(User, originalUser._id, req.body);
  respond(res, updatedUser);
});

const validateUser = (user) => {
  if (!ituserem) {
    throw new AppError('User does not exist', 404);
  }
};
exports.getMe = catchAsync(async (req, res, next) => {
  user = await factory.getOne(User, req.user._id);
  respond(res, user);
});
