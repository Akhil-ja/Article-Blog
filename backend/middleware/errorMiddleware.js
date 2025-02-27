/* eslint-disable no-unused-vars */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.statusCode >= 500 ? "error" : "fail",
    message: err.message,
  });
};

export default globalErrorHandler;
