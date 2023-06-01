const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
  const Genre = sequelize.define("Genres",
    {
      id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
      title: { type: DataTypes.STRING, allowNull: false},
      img: { type: DataTypes.STRING, allowNull: false},
    }
  );
module.exports = {Genre};