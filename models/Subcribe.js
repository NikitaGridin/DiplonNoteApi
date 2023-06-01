const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Subcribe = sequelize.define('Subcribe', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
},
);
module.exports = {Subcribe};