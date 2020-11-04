const Item = require('../models/itemModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const ShoppingList = require('../models/shoppingListModel');
const AppError = require('../utils/appError');
const respond = require('../utils/respond');

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await factory.getAll(Item, {}, req.query);
  respond(res, items);
});

exports.createItem = catchAsync(async (req, res, next) => {
  const newItem = await factory.createOne(Item, req.body);
  respond(res, newItem);
});

exports.getItem = catchAsync(async (req, res, next) => {
  const item = await factory.getOne(Item, req.params.itemId);
  validateItem(item);
  respond(res, item);
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const originalItem = await factory.getOne(Item, req.params.itemId);
  validateItem(originalItem);

  await factory.deleteOne(Item, originalItem._id);
  respond(res);
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const originalItem = await factory.getOne(Item, req.params.itemId);
  validateItem(originalItem);

  const updatedItem = await factory.updateOne(Item, originalItem._id, req.body);
  respond(res, updatedItem);
});

const validateItem = (item) => {
  if (!item) {
    throw new AppError('Item does not exist', 404);
  }
};
