const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const PlaylistTrack = sequelize.define('PlaylistsTracks', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
});
module.exports = {PlaylistTrack};