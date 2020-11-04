const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const shoppingListRouter = require('./routes/shoppingListRoutes');
const itemRouter = require('./routes/itemRoutes');
const AppError = require('./utils/appError');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/shoppingLists', shoppingListRouter);
app.use('/api/v1/items', itemRouter);

//Exicuted after all other routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Global Error handler
app.use(globalErrorHandler);

module.exports = app;
