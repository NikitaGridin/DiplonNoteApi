const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const LibrayAlbum = sequelize.define('LibrayAlbums', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});
module.exports = {LibrayAlbum};