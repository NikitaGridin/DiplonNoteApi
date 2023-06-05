function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Что-то пошло не так!";

  res.status(err.statusCode || 500).send(err.message);

  return next(err);
}

module.exports = errorHandler;
