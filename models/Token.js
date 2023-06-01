const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Token = sequelize.define("Token",
    {
      id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
      refreshToken: {   type: DataTypes.TEXT, allowNull: false},
    }
  );
module.exports = {Token};