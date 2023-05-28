const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
  
//Модель хранящая информацию о пользователе и треках которые он добавил
const LibrayTrack = sequelize.define('LibrayTracks', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},

});
  
    module.exports = {LibrayTrack};