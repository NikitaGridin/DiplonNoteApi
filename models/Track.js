const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");

//Модель трека
const Track = sequelize.define(
    "Track",
    {
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    title: { type: DataTypes.STRING, allowNull: false}, 
    audio: { type: DataTypes.STRING, allowNull: false},
    }
  );

  module.exports = {Track};