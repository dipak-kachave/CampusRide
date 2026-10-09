const RentalBooking = require("../models/RentalBooking");
const Vehicle = require("../models/Vehicle");

// @desc    Book a vehicle
// @route   POST /api/rentals/book
// @access  Private (Renter)
const bookVehicle = async (req, res) => {
  try {
    const {
      vehicleId,
      destinationOrPurpose,
      estimatedHours,
      estimatedKm,
      notes,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "This vehicle is currently not available for rent.",
      });
    }

    // Cannot rent your own vehicle
    if (vehicle.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot rent your own vehicle.",
      });
    }

    // Create booking
    const booking = await RentalBooking.create({
      vehicle: vehicle._id,
      owner: vehicle.owner,
      renter: req.user._id,
      destinationOrPurpose: destinationOrPurpose || "Shirpur Bus Stand / Town",
      estimatedHours: estimatedHours || 2,
      estimatedKm: estimatedKm || 10,
      ratePerKm: vehicle.ratePerKm || 12, // ₹12/km rate
      notes: notes || "",
      status: "Requested",
    });

    const populated = await RentalBooking.findById(booking._id)
      .populate("vehicle", "name vehicleNumber type location ratePerKm")
      .populate("owner", "name phone department year")
      .populate("renter", "name phone department year prn");

    res.status(201).json({
      success: true,
      message: `Booking request sent to owner! Estimated fare: ₹${(estimatedKm || 10) * (vehicle.ratePerKm || 12)}`,
      booking: populated,
    });
  } catch (error) {
    console.error("Book Vehicle Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get renter's bookings
// @route   GET /api/rentals/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await RentalBooking.find({ renter: req.user._id })
      .populate("vehicle", "name vehicleNumber type location ratePerKm ratePerHour")
      .populate("owner", "name phone department year rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get owner's incoming rental requests
// @route   GET /api/rentals/my-requests
// @access  Private
const getMyRentalRequests = async (req, res) => {
  try {
    const requests = await RentalBooking.find({ owner: req.user._id })
      .populate("vehicle", "name vehicleNumber type location ratePerKm")
      .populate("renter", "name phone department year prn isVerified rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Owner accepts rental request
// @route   PUT /api/rentals/:id/accept
// @access  Private (Owner Only)
const acceptBooking = async (req, res) => {
  try {
    const booking = await RentalBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    booking.status = "Accepted";
    await booking.save();

    res.json({
      success: true,
      message: "Rental request accepted. Meet renter for key handover!",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Owner rejects rental request
// @route   PUT /api/rentals/:id/reject
// @access  Private (Owner Only)
const rejectBooking = async (req, res) => {
  try {
    const booking = await RentalBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    booking.status = "Rejected";
    await booking.save();

    res.json({ success: true, message: "Booking request rejected", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start trip on key handover (Record Start KM & verify OTP)
// @route   PUT /api/rentals/:id/start
// @access  Private (Owner Only)
const startTrip = async (req, res) => {
  try {
    const { startKm, otp } = req.body;
    const booking = await RentalBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (otp && otp !== booking.pickupOtp) {
      return res.status(400).json({ success: false, message: "Invalid Pickup OTP provided by renter" });
    }

    if (!startKm || Number(startKm) <= 0) {
      return res.status(400).json({ success: false, message: "Please enter current odometer Start KM" });
    }

    booking.startKm = Number(startKm);
    booking.startTime = new Date();
    booking.status = "Active";
    await booking.save();

    // Mark vehicle as Booked
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "Booked" });

    res.json({
      success: true,
      message: "Trip started successfully! Bike handed over.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete trip on return (Record End KM, Calculate total KM & ₹10/KM amount)
// @route   PUT /api/rentals/:id/complete
// @access  Private (Owner Only)
const completeTrip = async (req, res) => {
  try {
    const { endKm } = req.body;
    const booking = await RentalBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!endKm || Number(endKm) < (booking.startKm || 0)) {
      return res.status(400).json({
        success: false,
        message: `End KM (${endKm}) must be greater than or equal to Start KM (${booking.startKm})`,
      });
    }

    const calculatedKm = Number(endKm) - (booking.startKm || 0);
    const ratePerKm = booking.ratePerKm || 12; // ₹12 per KM
    const totalAmount = Math.max(calculatedKm * ratePerKm, 12); // Minimum ₹12 charge

    booking.endKm = Number(endKm);
    booking.totalKm = calculatedKm;
    booking.totalAmount = totalAmount;
    booking.endTime = new Date();
    booking.status = "Completed";
    booking.paymentStatus = "Paid (Cash/UPI)";
    await booking.save();

    // Restore vehicle status to Available and increment trip count
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      status: "Available",
      $inc: { totalTrips: 1 },
    });

    res.json({
      success: true,
      message: `Trip completed! Total distance: ${calculatedKm} KM. Final Amount: ₹${totalAmount} (at ₹${ratePerKm}/KM).`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookVehicle,
  getMyBookings,
  getMyRentalRequests,
  acceptBooking,
  rejectBooking,
  startTrip,
  completeTrip,
};
