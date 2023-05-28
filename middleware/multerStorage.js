const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
  destination: 'uploads/images',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error("Можно загружать только фотографии!"), { statusCode: 404 }), false);
  }
};

const imageUpload = multer({ storage: imageStorage, fileFilter: imageFilter });

const albumStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images');
    } else if (file.mimetype.startsWith('audio/')) {
      cb(null, 'uploads/audio');
    } else {
      cb(new Error('Можно загружать только аудио и фотографии'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: albumStorage });

module.exports = { imageUpload, upload };
