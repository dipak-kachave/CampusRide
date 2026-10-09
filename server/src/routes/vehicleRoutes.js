const express = require("express");
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  getMyVehicles,
  toggleVehicleStatus,
} = require("../controllers/vehicleController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllVehicles);
router.get("/my", protect, getMyVehicles);
router.get("/:id", getVehicleById);
router.post("/", protect, createVehicle);
router.put("/:id/status", protect, toggleVehicleStatus);

module.exports = router;
