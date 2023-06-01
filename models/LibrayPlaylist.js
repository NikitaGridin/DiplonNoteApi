const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const LibrayPlaylist = sequelize.define('LibrayPlaylists', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
});
module.exports = {LibrayPlaylist};