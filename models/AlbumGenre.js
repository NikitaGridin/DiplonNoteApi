const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const AlbumGenre = sequelize.define("AlbumGenre", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});
module.exports = { AlbumGenre };
