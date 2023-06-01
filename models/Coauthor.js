const { sequelize } = require("../db");
const { DataTypes } = require("@sequelize/core");
const Coauthor = sequelize.define('Coauthors', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
  user_confirm: DataTypes.ENUM('wait', 'confirm', 'rejected'),
});
module.exports = {Coauthor};
    