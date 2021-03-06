const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const respond = require('../utils/respond');
const factory = require('./handlerFactory');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000
    ),
    httpOnly: true,
  });

  user.password = undefined;

  respond(res, user, statusCode, token);
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await factory.createOne(User, req.body);
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password in request
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password to log in!', 400)
    );
  }

  //Check if user belonging to the email exists and the password is correct
  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Incorrect email or password', 401));
  }

  //If everything is ok then send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //Get token from either bearer or from cookies and check if it exists
  //Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.token) {
    token = req.headers.token;
  }
  console.log(token);
  if (!token) {
    next(
      new AppError('You are not logged in! Please log in and try again.', 401)
    );
  }

  //Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  //Check if user still exists
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exists')
    );
  }

  //Check if user changed password after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.')
    );
  }

  //If we get to here without error then grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictToAdmin = () => {
  return (req, res, next) => {
    //Restrict if selecting specific shopping lists
    if (req.user.role !== 'admin') {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1) Get user based on POSTed email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError('There is no user with that email address.', 404));
//   }

//   //2) Generate random token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   //3) Send it to the user's email
//   try {
//     const resetURL = `${req.protocol}://${req.get(
//       'host'
//     )}/api/v1/users/resetPassword/${resetToken}`;

//     await new Email(user, resetURL).sendPasswordReset();
//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError(
//         'There was an error sending the email. Try again later!',
//         500
//       )
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1) get user based on the token
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2) If token has not expired, and there is a user, set the new password
//   if (!user) {
//     return next(new AppError('Token is invalid or has expired', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;

//   await user.save();

//   //3) Update changedPasswordAt property for the user

//   //4) Log the user in, send JWT
//   createSendtoken(user, 200,req, res);
// });
