const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../models/itemModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const items = JSON.parse(fs.readFileSync(`${__dirname}/items.json`, 'utf-8'));

const importData = async () => {
  try {
    await Item.create(items);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Item.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
