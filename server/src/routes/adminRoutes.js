const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsersAdmin,
  getIdCardPhoto,
  verifyDecision,
  getAllRidesAdmin,
  getFlaggedUsersAdmin,
  moderateUserAction,
  toggleUserVerification,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes require authentication and Admin role (dipakka974@gmail.com)
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsersAdmin);
router.get("/users/:id/id-card-photo", protect, adminOnly, getIdCardPhoto);
router.put("/users/:id/verify-decision", protect, adminOnly, verifyDecision);
router.put("/users/:id/verify", protect, adminOnly, toggleUserVerification);
router.get("/rides", protect, adminOnly, getAllRidesAdmin);
router.get("/flagged-users", protect, adminOnly, getFlaggedUsersAdmin);
router.put("/users/:id/action", protect, adminOnly, moderateUserAction);

module.exports = router;
