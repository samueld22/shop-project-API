const express = require('express');

const shoppingListController = require('../controllers/shoppingListController');
const authController = require('../controllers/authController');
//const itemRouter = require('./itemRoutes');

const router = express.Router({ mergeParams: true });

//Protects all routes i.e. must be logged in to access them
router.use(authController.protect);

router
  .route('/')
  .get(shoppingListController.getAllShoppingLists)
  .post(shoppingListController.createShoppingList);

router
  .route('/:shoppingListId')
  .get(shoppingListController.getShoppingList)
  .delete(shoppingListController.deleteShoppingList);

router
  .route('/:shoppingListId/rename')
  .patch(shoppingListController.updateShoppingListName);

router
  .route('/:shoppingListId/addItem')
  .put(shoppingListController.addItemsToList);

router
  .route('/:shoppingListId/deleteItem')
  .put(shoppingListController.deleteItemsFromList);

module.exports = router;
