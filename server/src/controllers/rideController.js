const Ride = require("../models/Ride");

// @desc    Get all active rides (with search filters)
// @route   GET /api/rides
// @access  Public
const getAllRides = async (req, res) => {
  try {
    const { from, to, search } = req.query;
    let query = { status: { $in: ["Active", "Full"] } };

    if (from) {
      query.from = { $regex: from, $options: "i" };
    }
    if (to) {
      query.to = { $regex: to, $options: "i" };
    }
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: "i" } },
        { to: { $regex: search, $options: "i" } },
        { vehicleInfo: { $regex: search, $options: "i" } },
      ];
    }

    const rides = await Ride.find(query)
      .populate("driver", "name phone department year rating isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified rating")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("Get Rides Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "name phone department year rating isVerified")
      .populate("passengers.user", "name phone department year");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish a new ride
// @route   POST /api/rides
// @access  Private (Driver)
const createRide = async (req, res) => {
  try {
    const { from, to, departureTime, seatsTotal, pricePerSeat, vehicleInfo, notes, distanceKm, ratePerKm } = req.body;

    if (!from || !to || !departureTime || !vehicleInfo) {
      return res.status(400).json({
        success: false,
        message: "Please provide origin, destination, departure time and vehicle info",
      });
    }

    const totalSeats = Number(seatsTotal) || 2;
    const dist = Number(distanceKm) || 3.2;
    const rate = Number(ratePerKm) || 12;
    // If pricePerSeat is not explicitly provided, calculate using dist * rate / totalSeats or nominal fair
    const calculatedPrice = pricePerSeat !== undefined && pricePerSeat !== ""
      ? Number(pricePerSeat)
      : Math.max(Math.round((dist * rate) / Math.max(totalSeats, 1)), 15);

    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      departureTime,
      seatsTotal: totalSeats,
      seatsAvailable: totalSeats,
      distanceKm: dist,
      ratePerKm: rate,
      pricePerSeat: calculatedPrice,
      vehicleInfo,
      notes: notes || "Leaving from campus. Safe ride guaranteed.",
      status: "Active",
    });

    const populated = await Ride.findById(ride._id).populate(
      "driver",
      "name phone department year rating isVerified"
    );

    res.status(201).json({
      success: true,
      message: "Ride published successfully! Other students can now request seats.",
      ride: populated,
    });
  } catch (error) {
    console.error("Create Ride Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Passenger requests a seat
// @route   POST /api/rides/:id/request
// @access  Private (Passenger)
const requestSeat = async (req, res) => {
  try {
    const { seatsBooked, pickupPoint } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (ride.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This ride is no longer accepting requests (Full or Completed).",
      });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a seat on your own published ride.",
      });
    }

    const requestedSeats = Number(seatsBooked) || 1;
    if (requestedSeats > ride.seatsAvailable) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.seatsAvailable} seat(s) available on this ride.`,
      });
    }

    // Check if user already requested
    const alreadyRequested = ride.passengers.some(
      (p) => p.user.toString() === req.user._id.toString() && p.status !== "Rejected"
    );
    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: "You have already requested a seat on this ride.",
      });
    }

    ride.passengers.push({
      user: req.user._id,
      seatsBooked: requestedSeats,
      pickupPoint: pickupPoint || ride.from,
      status: "Requested",
    });

    await ride.save();

    res.status(200).json({
      success: true,
      message: "Seat request sent to driver! They will accept or decline.",
      ride,
    });
  } catch (error) {
    console.error("Request Seat Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Driver responds to passenger request (Accept / Reject)
// @route   PUT /api/rides/:id/respond-passenger
// @access  Private (Driver Only)
const respondPassenger = async (req, res) => {
  try {
    const { passengerId, decision } = req.body; // decision: "accept" | "reject"
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized as driver" });
    }

    const passenger = ride.passengers.id(passengerId);
    if (!passenger) {
      return res.status(404).json({ success: false, message: "Passenger request not found" });
    }

    if (decision === "accept") {
      if (ride.seatsAvailable < passenger.seatsBooked) {
        return res.status(400).json({ success: false, message: "Not enough seats available" });
      }

      passenger.status = "Accepted";
      ride.seatsAvailable -= passenger.seatsBooked;

      if (ride.seatsAvailable === 0) {
        ride.status = "Full";
      }
    } else {
      passenger.status = "Rejected";
    }

    await ride.save();

    res.json({
      success: true,
      message: decision === "accept" ? "Passenger request accepted!" : "Passenger request declined.",
      ride,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ride status (Complete or Cancel)
// @route   PUT /api/rides/:id/status
// @access  Private (Driver Only)
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Completed" | "Cancelled"
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized as driver" });
    }

    ride.status = status;
    await ride.save();

    res.json({
      success: true,
      message: `Ride marked as ${status}`,
      ride,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's published rides
// @route   GET /api/rides/my-published
// @access  Private
const getMyPublishedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate("passengers.user", "name phone department year prn rating isVerified")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rides current user has requested/joined
// @route   GET /api/rides/my-joined
// @access  Private
const getMyJoinedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ "passengers.user": req.user._id })
      .populate("driver", "name phone department year rating isVerified")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRides,
  getRideById,
  createRide,
  requestSeat,
  respondPassenger,
  updateRideStatus,
  getMyPublishedRides,
  getMyJoinedRides,
};
