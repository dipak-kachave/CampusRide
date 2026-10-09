const express = require("express");
const router = express.Router();
const {
  getAllRides,
  getRideById,
  createRide,
  requestSeat,
  respondPassenger,
  updateRideStatus,
  getMyPublishedRides,
  getMyJoinedRides,
} = require("../controllers/rideController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllRides);
router.get("/my-published", protect, getMyPublishedRides);
router.get("/my-joined", protect, getMyJoinedRides);
router.get("/:id", getRideById);
router.post("/", protect, createRide);
router.post("/:id/request", protect, requestSeat);
router.put("/:id/respond-passenger", protect, respondPassenger);
router.put("/:id/status", protect, updateRideStatus);

module.exports = router;
