const tokenService = require("../service/tokenService");

module.exports = function (req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      throw Object.assign(new Error("Не авторизован!"), { statusCode: 500 });
    }
    const accesToken = authorization.split(" ")[1];
    if (!accesToken) {
      throw Object.assign(new Error("Не авторизован!"), { statusCode: 500 });
    }

    const userData = tokenService.validateAccesToken(accesToken);

    if (!userData) {
      throw Object.assign(new Error("Не авторизован!"), { statusCode: 500 });
    }

    req.user = userData;

    next();
  } catch (error) {
    throw Object.assign(new Error("Не авторизован!"), { statusCode: 500 });
  }
};
