const jwt = require("jsonwebtoken");
const { Token } = require("../models/Token");
class TokenService {
  generateToken(payload) {
    const accesToken = jwt.sign(payload, process.env.JWT_ACCES_SECRET, {
      expiresIn: "30s",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return {
      accesToken,
      refreshToken,
    };
  }
  async saveToken(UserId, refreshToken) {
    const tokeData = await Token.findOne({ where: { UserId } });
    if (tokeData) {
      tokeData.refreshToken = refreshToken;
      return tokeData.save();
    }
    const token = await Token.create({ refreshToken, UserId });
    return token;
  }

  validateAccesToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCES_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  async removeToken(refreshToken) {
    const tokeData = await Token.destroy({ where: { refreshToken } });
    return tokeData;
  }

  async findToken(refreshToken) {
    const tokeData = await Token.findOne({ where: { refreshToken } });
    return tokeData;
  }
}

module.exports = new TokenService();
