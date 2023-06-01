const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Album = sequelize.define(
    "Album",
    {
      id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
      title: { type: DataTypes.STRING, allowNull: false},
      img: { type: DataTypes.STRING, allowNull: false},
      type: DataTypes.ENUM('Album', 'Ep', 'Single'),
      status: {
        type: DataTypes.ENUM('wait', 'publication', 'rejected'),
        defaultValue: 'wait'
      },
    }
  );  
  module.exports = {Album};