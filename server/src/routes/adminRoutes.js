const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsersAdmin,
  getAllRidesAdmin,
  toggleUserVerification,
  toggleVehicleApproval,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes require authentication and Admin role (dipakka974@gmail.com)
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsersAdmin);
router.get("/rides", protect, adminOnly, getAllRidesAdmin);
router.put("/users/:id/verify", protect, adminOnly, toggleUserVerification);
router.put("/vehicles/:id/approve", protect, adminOnly, toggleVehicleApproval);

module.exports = router;
