const express = require('express');

const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

const router = express.Router();

//Anyone can GET the items
router.route('/').get(itemController.getAllItems);
router.route('/:itemId').get(itemController.getItem);

//Restricts access to creating, changing or deleting items from the item pool to admins
router.use(authController.protect);
router.use(authController.restrictToAdmin());

router.route('/').post(itemController.createItem);

router
  .route('/:itemId')
  .patch(itemController.updateItem)
  .delete(itemController.deleteItem);

module.exports = router;
