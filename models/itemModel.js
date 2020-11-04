const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item must have a name!'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'Item must have a price!'],
    min: [0, 'Price must be positive!'],
  },
  catagory: {
    type: String,
    enum: [
      'meat',
      'veg',
      'fruit',
      'tins',
      'jars',
      'condements',
      'sweets',
      'crisps',
      'frozen',
      'bakery',
      'pasta-and-rice',
      'toiletries',
    ],
    required: true,
  },
});

//itemSchema.pre(/^find/, function(next) {});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
