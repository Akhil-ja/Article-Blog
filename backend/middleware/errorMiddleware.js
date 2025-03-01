const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : "Something went wrong!";

  console.error(err);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export default globalErrorHandler;
