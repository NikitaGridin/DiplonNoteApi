const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const LibrayTrack = sequelize.define('LibrayTracks', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
});
module.exports = {LibrayTrack};