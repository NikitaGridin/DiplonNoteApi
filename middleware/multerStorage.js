const multer = require("multer");
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images");
    } else {
      cb(new Error("Можно загружать только Фото"));
    }
    console.log(file);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const imageUpload = multer({
  storage: imageStorage,
});

const albumStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images");
    } else if (file.mimetype.startsWith("audio/")) {
      cb(null, "uploads/audio");
    } else {
      console.log(file);
      cb(new Error("Можно загружать только фото и аудио"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: albumStorage });

module.exports = { imageUpload, upload };
