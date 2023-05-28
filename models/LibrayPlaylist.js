const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
  
//Модель хранящая информацию о пользователе и плейлистах которые он добавил
const LibrayPlaylist = sequelize.define('LibrayPlaylists', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
});
  
module.exports = {LibrayPlaylist};