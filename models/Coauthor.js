const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Coauthor = sequelize.define("Coauthors", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_confirm: {
    type: DataTypes.ENUM("wait", "confirm", "rejected"),
    defaultValue: "wait",
  },
});
module.exports = { Coauthor };
