const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shopping list must have a name'],
    default: 'Unnamed',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Shopping list must have a user'],
  },
  items: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//Add middleware to create shopping list name from user name
//Add middleware to create shopping list total cost from list of items

shoppingListSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'items',
    select: '-__v',
  });
  next();
});

//itemSchema.pre(/^find/, function(next) {});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;
