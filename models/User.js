const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");

//Модель пользователя
const User = sequelize.define(
    "User",
    {
      id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
      nickname: { type: DataTypes.STRING, allowNull: false, unique: true},
      email: { type: DataTypes.STRING, allowNull: false, unique: true},
      password: { type: DataTypes.STRING, allowNull: false},
      img: { type: DataTypes.STRING, allowNull: false},
      role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user'},
      activationCode: {type: DataTypes.STRING, allowNull: false},
      isActivation: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
    }
  );
  
  module.exports = {User};