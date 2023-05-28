const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
  
//Модель хранящая информацию о пользователе и альбомах которые он добавил
const LibrayAlbum = sequelize.define('LibrayAlbums', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // Название модели пользователя
      key: 'id' // id пользователя
    }
  }
});
  
    module.exports = {LibrayAlbum};