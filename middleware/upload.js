const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/x-m4a",
      "audio/m4a",
      "audio/mp4",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only audio files (.mp3, .wav, .m4a) are allowed"));
    }
    cb(null, true);
  },
});

module.exports = { upload };
