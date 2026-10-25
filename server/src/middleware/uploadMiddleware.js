const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Ensure private uploads directory exists
const uploadDir = path.join(__dirname, "../../private_uploads/idcards");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, randomName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png image files are allowed."), false);
  }
};

const uploadIdCard = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter,
});

module.exports = {
  uploadIdCard,
  uploadDir,
};
