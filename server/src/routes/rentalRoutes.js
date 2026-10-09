const express = require("express");
const router = express.Router();
const {
  bookVehicle,
  getMyBookings,
  getMyRentalRequests,
  acceptBooking,
  rejectBooking,
  startTrip,
  completeTrip,
} = require("../controllers/rentalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/book", protect, bookVehicle);
router.get("/my-bookings", protect, getMyBookings);
router.get("/my-requests", protect, getMyRentalRequests);
router.put("/:id/accept", protect, acceptBooking);
router.put("/:id/reject", protect, rejectBooking);
router.put("/:id/start", protect, startTrip);
router.put("/:id/complete", protect, completeTrip);

module.exports = router;
