module.exports = (res, data = null, statusCode = 200, token = undefined) => {
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      data,
    },
  });
};
