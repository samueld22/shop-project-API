const ShoppingList = require('../models/shoppingListModel');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const respond = require('../utils/respond');
const factory = require('./handlerFactory');

//If logged in as a user, will return the user's shopping lists
//If logged in as an admin, will return ALL shopping lists
exports.getAllShoppingLists = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user.role === 'user') {
    filter = { user: req.user.id };
  }
  shoppingLists = await factory.getAll(ShoppingList, filter);
  respond(res, shoppingLists);
});

//If logged in as an admin, will return a new shopping list with a specified userId in req.body
//If logged in as a user, will return a new shopping list the logged in user's Id
exports.createShoppingList = catchAsync(async (req, res, next) => {
  let userId;
  if (req.user.role === 'admin') {
    if (!req.body.user) {
      return next(new AppError('User ID not specified', 400));
    }
    userId = req.body.user;

    //Check whether user exists
    user = await factory.getOne(User, userId);
    if (!user) {
      return next(AppError('User does not exist', 404));
    }
  } else {
    if (req.body.user) {
      return next(
        new AppError(
          'You do not have the permission to specify a different user Id',
          400
        )
      );
    }
    userId = req.user._id;
  }
  if (!req.body.name) {
    return next(new AppError('Must provide a name for the shopping list'));
  }
  newShoppingList = await factory.createOne(ShoppingList, {
    user: userId,
    name: req.body.name,
  });
  respond(res, newShoppingList);
});

//If logged in as admin, gets access to all lists
//If logged in as user, gets access to their lists
exports.getShoppingList = catchAsync(async (req, res, next) => {
  //Get shopping list
  shoppingList = await factory.getOne(ShoppingList, req.params.shoppingListId);
  //Validate request
  validateList(req, shoppingList);

  respond(res, shoppingList);
});

exports.deleteShoppingList = catchAsync(async (req, res, next) => {
  //Get shopping list
  shoppingList = await factory.getOne(ShoppingList, req.params.shoppingListId);
  //Validate request
  validateList(req, shoppingList);

  await factory.deleteOne(ShoppingList, shoppingList._id);
  respond(res);
});

exports.updateShoppingListName = catchAsync(async (req, res, next) => {
  //Check whether shopping list is owned by the user
  shoppingList = await factory.getOne(ShoppingList, req.params.shoppingListId);
  validateList(req, shoppingList);

  if (!req.body.name) {
    throw new AppError('Must provide a new name!', 400);
  }

  const updatedShoppingList = await factory.updateOne(
    ShoppingList,
    req.params.shoppingListId,
    { name: req.body.name }
  );

  respond(res, updatedShoppingList);
});

exports.addItemsToList = catchAsync(async (req, res, next) => {
  //console.log(`Adding item to list ${req.params.shoppingListId}`);
  //Check whether shopping list is owned by the user
  shoppingList = await factory.getOne(ShoppingList, req.params.shoppingListId);
  validateList(req, shoppingList);

  //Check whether item exists within item pool
  const items = await factory.getAll(Item, { _id: { $in: req.body.items } });
  const itemIds = items.map((el) => {
    return el._id;
  });

  //Check whether any of the items don't exist
  if (itemIds.length !== req.body.items.length) {
    return next(new AppError('One or more of these items do not exist!', 400));
  }

  //Check whether any of the items already exists within shopping list
  itemIds.forEach((el) => {
    if (shoppingList.items.includes(el)) {
      throw new AppError(
        'One or more of these items already exists in this shopping list',
        400
      );
    }
  });

  const updatedItems = [...shoppingList.items, ...itemIds];

  //Update Shopping list items
  const updatedShoppingList = await factory.updateOne(
    ShoppingList,
    req.params.shoppingListId,
    { items: updatedItems }
  );
  respond(res, updatedShoppingList);
});

exports.deleteItemsFromList = catchAsync(async (req, res, next) => {
  //Get shopping list and check if it exists
  shoppingList = await factory.getOne(ShoppingList, req.params.shoppingListId);
  validateList(req, shoppingList);

  let newItemList = [...shoppingList.items];
  //Loop through each inputted item
  req.body.items.forEach((deletingItem, i) => {
    //Check whether inputted items are in the shopping list
    if (!shoppingList.items.includes(deletingItem)) {
      throw new AppError(
        'One or more of these items is not in this shopping list',
        400
      );
    }
    //Find index of the item in the shopping list that is the same as the item in the body and delete that item from the shopping list array
    deletingIndex = newItemList.findIndex(
      (el) => String(el) === String(deletingItem)
    );
    newItemList.splice(deletingIndex, 1);
  });

  //Delete from list
  const updatedShoppingList = await factory.updateOne(
    ShoppingList,
    req.params.shoppingListId,
    { items: newItemList }
  );
  respond(res, updatedShoppingList);
});

const validateList = (req, shoppingList) => {
  //Check if shopping list exists and if user has access to it
  if (
    !shoppingList ||
    (req.user.role === 'user' &&
      String(shoppingList.user) !== String(req.user._id))
  ) {
    throw new AppError('Shopping list does not exist!', 404);
  }
};
