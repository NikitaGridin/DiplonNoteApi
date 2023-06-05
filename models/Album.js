const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Album = sequelize.define("Album", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  img: { type: DataTypes.STRING, allowNull: false },
  type: DataTypes.ENUM("Album", "Ep", "Single"),
  status: {
    type: DataTypes.ENUM("wait", "publication", "rejected"),
    defaultValue: "wait",
  },
  date_create: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = { Album };
