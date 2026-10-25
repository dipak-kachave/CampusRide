const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  uploadIdCardPhoto,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadIdCard } = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/upload-id-card", protect, uploadIdCard.single("idCard"), uploadIdCardPhoto);

module.exports = router;
