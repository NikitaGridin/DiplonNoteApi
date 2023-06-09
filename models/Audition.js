const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Audition = sequelize.define('Auditions', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
  date_create: {type: DataTypes.DATE,allowNull: false,defaultValue: DataTypes.NOW,}
});
module.exports = {Audition};