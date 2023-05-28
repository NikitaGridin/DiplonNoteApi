function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Что-то пошло не так!';
  if (res.headersSent) {
    return next(err);
  }
  res.status(statusCode).send(message);
}

module.exports = errorHandler;
