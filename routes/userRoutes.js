const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// const shoppingListRouter = require('./shoppingListRoutes');

const router = express.Router();

//Authentication routes
router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);

// //Protect all the following routes
router.use(authController.protect);
router.route('/me', userController.getMe);

router.use(authController.restrictToAdmin());

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:userId')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
