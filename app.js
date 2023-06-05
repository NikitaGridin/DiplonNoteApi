const express = require("express");
const app = express();
const { sequelize } = require("./db");
const cookieParser = require("cookie-parser");
const routes = require("./routes/routes");
const multer = require("multer");

const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
app.use(express.static("uploads"));
app.use(cookieParser());

app.use("/api", routes);
app.use(errorHandler);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error(error));
