const { Sequelize } = require("@sequelize/core");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    //Отключение запросов в консоли
    logging: false,
    timezone: "+00:00",
    define: {
      timestamps: false,
    },
  }
);
sequelize
  .authenticate()
  .then(() => {
    console.log("Подключение к базе данных успешно установлено");
  })
  .catch((error) => {
    console.error("Ошибка подключения к базе данных:", error);
  });
module.exports = { sequelize };
