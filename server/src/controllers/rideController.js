const Ride = require("../models/Ride");
const User = require("../models/User");
const Notification = require("../models/Notification");
const campusConfig = require("../config/campus");

// Helper: Sanitize contact reveal based on status and viewer role
function sanitizeRide(rideDoc, viewerId) {
  if (!rideDoc) return null;
  const ride = rideDoc.toObject ? rideDoc.toObject() : JSON.parse(JSON.stringify(rideDoc));

  const vIdStr = viewerId ? (viewerId._id ? viewerId._id.toString() : viewerId.toString()) : null;
  const driverIdStr = ride.driver?._id ? ride.driver._id.toString() : ride.driver?.toString();
  const isDriver = vIdStr && driverIdStr === vIdStr;

  let isAcceptedPassenger = false;
  if (vIdStr && ride.passengers && Array.isArray(ride.passengers)) {
    isAcceptedPassenger = ride.passengers.some((p) => {
      const pUserIdStr = p.user?._id ? p.user._id.toString() : p.user?.toString();
      return pUserIdStr === vIdStr && p.status === "Accepted";
    });
  }

  // 1. Driver phone: visible ONLY to driver themselves or an Accepted passenger
  if (!isDriver && !isAcceptedPassenger) {
    if (ride.driver && typeof ride.driver === "object") {
      delete ride.driver.phone;
    }
  }

  // 2. Passenger phone: driver sees ONLY if status === "Accepted". Passengers see ONLY their own phone.
  if (ride.passengers && Array.isArray(ride.passengers)) {
    ride.passengers = ride.passengers.map((p) => {
      const pUserIdStr = p.user?._id ? p.user._id.toString() : p.user?.toString();
      const isSelf = vIdStr && pUserIdStr === vIdStr;
      const isAcceptedAndDriver = isDriver && p.status === "Accepted";

      if (!isSelf && !isAcceptedAndDriver) {
        if (p.user && typeof p.user === "object") {
          delete p.user.phone;
        }
        // Non-accepted passengers or third parties do not see private pickupPoint
        if (!isDriver && !isSelf) {
          p.pickupPoint = "Campus Pickup";
        }
      }
      return p;
    });
  }

  return ride;
}

// @desc    Get all active rides (with search & trust filters)
// @route   GET /api/rides
// @access  Public
const getAllRides = async (req, res) => {
  try {
    const { from, to, search, maxPrice, date, womenOnly, minRating } = req.query;
    const now = new Date();

    // Rides whose departureTime has passed are hidden
    let query = {
      status: { $in: ["Active", "Full"] },
      departureTime: { $gt: now },
    };

    if (from && from !== "All" && from.trim() !== "") {
      query.from = { $regex: from.trim(), $options: "i" };
    }
    if (to && to !== "All" && to.trim() !== "") {
      query.to = { $regex: to.trim(), $options: "i" };
    }
    if (maxPrice) {
      query.pricePerSeat = { $lte: Number(maxPrice) };
    }
    if (womenOnly === "true") {
      query.womenOnly = true;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.departureTime = {
        $gte: startOfDay > now ? startOfDay : now,
        $lte: endOfDay,
      };
    }
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: "i" } },
        { to: { $regex: search, $options: "i" } },
        { vehicleInfo: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const rides = await Ride.find(query)
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified rating")
      .sort({ departureTime: 1 }); // Sort by earliest departure

    // Optional filter by minRating
    let filteredRides = rides;
    if (minRating) {
      filteredRides = rides.filter(
        (r) => (r.driver?.ratingAvg || r.driver?.rating || 5.0) >= Number(minRating)
      );
    }

    const viewerId = req.user?._id;
    const sanitized = filteredRides.map((r) => sanitizeRide(r, viewerId));

    res.json({
      success: true,
      count: sanitized.length,
      rides: sanitized,
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
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    const sanitized = sanitizeRide(ride, req.user?._id);
    res.json({ success: true, ride: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish a new ride
// @route   POST /api/rides
// @access  Private (Verified Driver)
const createRide = async (req, res) => {
  try {
    const user = req.user;

    // STEP 3: Verification Gating
    const isUserVerified = user.verificationStatus === "verified" || user.isVerified;
    if (!isUserVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified RCPIT members can publish rides. Please verify your ID card in your profile first.",
      });
    }

    // Safety: check suspension
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended: ${user.suspendedReason || "Safety violation"}. You cannot publish rides.`,
      });
    }

    const {
      from,
      to,
      departureTime,
      seatsTotal,
      pricePerSeat,
      vehicleInfo,
      notes,
      distanceKm,
      ratePerKm,
      womenOnly,
      luggageAllowed,
    } = req.body;

    if (!from || !to || !departureTime || !vehicleInfo) {
      return res.status(400).json({
        success: false,
        message: "Please provide origin, destination, departure time, and vehicle info",
      });
    }

    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (cleanFrom.length < 2 || cleanTo.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination pickup points must be at least 2 characters.",
      });
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination pickup points cannot be the same.",
      });
    }

    // STEP 1: Date departure validation (reject in past)
    const depDate = new Date(departureTime);
    if (isNaN(depDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid departure date-time format.",
      });
    }

    if (depDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Departure time cannot be in the past. Please choose a future time.",
      });
    }

    // STEP 1: Seats validation
    const totalSeats = Number(seatsTotal);
    if (!Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > campusConfig.maxSeats) {
      return res.status(400).json({
        success: false,
        message: `Seats must be an integer between 1 and ${campusConfig.maxSeats}.`,
      });
    }

    // STEP 1: Price validation
    const seatPrice = Number(pricePerSeat);
    if (
      isNaN(seatPrice) ||
      seatPrice < campusConfig.minPricePerSeat ||
      seatPrice > campusConfig.maxPricePerSeat
    ) {
      return res.status(400).json({
        success: false,
        message: `Price per seat must be between ₹${campusConfig.minPricePerSeat} and ₹${campusConfig.maxPricePerSeat}.`,
      });
    }

    const dist = Number(distanceKm) || 3.2;
    const rate = Number(ratePerKm) || 12;

    const ride = await Ride.create({
      driver: user._id,
      from: cleanFrom,
      to: cleanTo,
      departureTime: depDate,
      seatsTotal: totalSeats,
      seatsAvailable: totalSeats,
      distanceKm: dist,
      ratePerKm: rate,
      pricePerSeat: seatPrice,
      vehicleInfo,
      womenOnly: Boolean(womenOnly),
      luggageAllowed: luggageAllowed !== undefined ? Boolean(luggageAllowed) : true,
      notes: notes || "Leaving from campus. Safe ride guaranteed.",
      status: "Active",
    });

    const populated = await Ride.findById(ride._id).populate(
      "driver",
      "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge"
    );

    res.status(201).json({
      success: true,
      message: "Ride published successfully! Verified students can now request empty seats.",
      ride: sanitizeRide(populated, user._id),
    });
  } catch (error) {
    console.error("Create Ride Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Passenger requests a seat
// @route   POST /api/rides/:id/request
// @access  Private (Verified Passenger)
const requestSeat = async (req, res) => {
  try {
    const user = req.user;

    // STEP 3: Verification Gating
    const isUserVerified = user.verificationStatus === "verified" || user.isVerified;
    if (!isUserVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified RCPIT members can request seats. Please verify your ID card in your profile first.",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended: ${user.suspendedReason || "Safety violation"}. You cannot request seats.`,
      });
    }

    const { seatsBooked, pickupPoint } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    // STEP 2: Block driver requesting own ride
    if (ride.driver.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a seat on your own published ride.",
      });
    }

    // STEP 2: Block requesting expired, full or cancelled ride
    if (ride.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: `This ride is not accepting requests (Status: ${ride.status}).`,
      });
    }

    if (new Date(ride.departureTime).getTime() <= Date.now()) {
      ride.status = "Expired";
      await ride.save();
      return res.status(400).json({
        success: false,
        message: "This ride's departure time has already passed (Expired).",
      });
    }

    // STEP 5: Women-only ride check
    if (ride.womenOnly && user.gender !== "Female") {
      return res.status(403).json({
        success: false,
        message: "This ride is reserved for female students/staff only.",
      });
    }

    // STEP 2: Block requesting more seats than available
    const requestedSeats = Number(seatsBooked) || 1;
    if (requestedSeats < 1 || requestedSeats > ride.seatsAvailable) {
      return res.status(400).json({
        success: false,
        message: `Cannot request ${requestedSeats} seat(s). Only ${ride.seatsAvailable} seat(s) available.`,
      });
    }

    // STEP 2: Block duplicate active request by same user
    const hasActiveRequest = ride.passengers.some(
      (p) =>
        p.user.toString() === user._id.toString() &&
        ["Requested", "Accepted"].includes(p.status)
    );
    if (hasActiveRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active or accepted request on this ride.",
      });
    }

    // Validate pickup point from fixed campus points if provided
    let finalPickup = pickupPoint || ride.from;
    if (!campusConfig.pickupPoints.includes(finalPickup)) {
      finalPickup = ride.from;
    }

    ride.passengers.push({
      user: user._id,
      seatsBooked: requestedSeats,
      pickupPoint: finalPickup,
      status: "Requested",
    });

    await ride.save();

    // STEP 5: In-app notification to driver
    await Notification.create({
      recipient: ride.driver,
      title: "New Ride Request",
      message: `${user.name} requested ${requestedSeats} seat(s) for your trip (${ride.from} ➔ ${ride.to}).`,
      type: "ride_request",
      ride: ride._id,
    });

    const populated = await Ride.findById(ride._id)
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified");

    res.status(200).json({
      success: true,
      message: "Seat request sent to driver! You will be notified once they respond.",
      ride: sanitizeRide(populated, user._id),
    });
  } catch (error) {
    console.error("Request Seat Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Driver responds to passenger request (Atomic Accept / Reject)
// @route   PUT /api/rides/:id/respond-passenger
// @access  Private (Driver Only)
const respondPassenger = async (req, res) => {
  try {
    const { passengerId, decision } = req.body; // "accept" | "reject"
    const rideId = req.params.id;

    const baseRide = await Ride.findById(rideId);
    if (!baseRide) return res.status(404).json({ success: false, message: "Ride not found" });

    if (baseRide.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized as driver" });
    }

    const passengerTarget = baseRide.passengers.id(passengerId);
    if (!passengerTarget) {
      return res.status(404).json({ success: false, message: "Passenger request not found" });
    }

    if (decision === "accept") {
      // STEP 2: Atomic conditional update to prevent race conditions & overbooking
      const updatedRide = await Ride.findOneAndUpdate(
        {
          _id: rideId,
          driver: req.user._id,
          seatsAvailable: { $gte: passengerTarget.seatsBooked },
          passengers: {
            $elemMatch: { _id: passengerId, status: "Requested" },
          },
        },
        {
          $set: { "passengers.$.status": "Accepted" },
          $inc: { seatsAvailable: -passengerTarget.seatsBooked },
        },
        { new: true }
      )
        .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
        .populate("passengers.user", "name phone department year isVerified");

      if (!updatedRide) {
        return res.status(400).json({
          success: false,
          message: "Could not accept request: insufficient seats remaining or request was cancelled.",
        });
      }

      // If seatsAvailable reaches 0, mark as Full
      if (updatedRide.seatsAvailable === 0 && updatedRide.status === "Active") {
        updatedRide.status = "Full";
        await updatedRide.save();
      }

      // In-app notification to passenger
      await Notification.create({
        recipient: passengerTarget.user,
        title: "Seat Request Accepted! 🎉",
        message: `${req.user.name} accepted your request for ${updatedRide.from} ➔ ${updatedRide.to}. Driver phone is now visible!`,
        type: "request_accepted",
        ride: updatedRide._id,
      });

      return res.json({
        success: true,
        message: "Passenger request accepted!",
        ride: sanitizeRide(updatedRide, req.user._id),
      });
    } else {
      passengerTarget.status = "Rejected";
      await baseRide.save();

      // In-app notification to passenger
      await Notification.create({
        recipient: passengerTarget.user,
        title: "Seat Request Declined",
        message: `Your request for the ride (${baseRide.from} ➔ ${baseRide.to}) was declined by the driver.`,
        type: "request_rejected",
        ride: baseRide._id,
      });

      const populated = await Ride.findById(baseRide._id)
        .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
        .populate("passengers.user", "name phone department year isVerified");

      return res.json({
        success: true,
        message: "Passenger request declined.",
        ride: sanitizeRide(populated, req.user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Passenger cancels their seat request / booking
// @route   PUT /api/rides/:id/cancel-request
// @access  Private (Passenger)
const cancelRequest = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    const pIndex = ride.passengers.findIndex(
      (p) =>
        p.user.toString() === req.user._id.toString() &&
        ["Requested", "Accepted"].includes(p.status)
    );

    if (pIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No active or accepted seat request found to cancel.",
      });
    }

    const passenger = ride.passengers[pIndex];
    const wasAccepted = passenger.status === "Accepted";
    const seatsToRestore = passenger.seatsBooked;

    passenger.status = "Cancelled";

    let penaltyApplied = false;
    if (wasAccepted) {
      ride.seatsAvailable += seatsToRestore;
      if (ride.seatsAvailable > 0 && ride.status === "Full") {
        ride.status = "Active";
      }

      // Check cancellation window threshold
      const departureTime = new Date(ride.departureTime).getTime();
      const now = Date.now();
      const diffMinutes = (departureTime - now) / (1000 * 60);

      if (diffMinutes >= 0 && diffMinutes <= campusConfig.cancellationWindowMinutes) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { cancellationCount: 1 },
        });
        penaltyApplied = true;
      }
    }

    await ride.save();

    // In-app notification to driver
    await Notification.create({
      recipient: ride.driver,
      title: "Passenger Cancelled Seat",
      message: `${req.user.name} cancelled their ${wasAccepted ? "accepted" : "pending"} seat (${seatsToRestore} seat(s)) for ${ride.from} ➔ ${ride.to}.${penaltyApplied ? " (Late cancellation flag logged)" : ""}`,
      type: "request_cancelled",
      ride: ride._id,
    });

    const populated = await Ride.findById(ride._id)
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified");

    res.json({
      success: true,
      message: `Your booking has been cancelled.${penaltyApplied ? ` (Cancellation flag logged: cancelled within ${campusConfig.cancellationWindowMinutes} mins of departure)` : ""}`,
      ride: sanitizeRide(populated, req.user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ride status (Complete or Cancel by Driver)
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

    if (!["Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Completed or Cancelled" });
    }

    ride.status = status;
    await ride.save();

    // If ride is Completed:
    if (status === "Completed") {
      // Increment ridesCompleted for driver
      await User.findByIdAndUpdate(ride.driver, { $inc: { ridesCompleted: 1 } });

      // Increment ridesCompleted for each Accepted passenger
      const acceptedPassengers = ride.passengers.filter((p) => p.status === "Accepted");
      for (const p of acceptedPassengers) {
        await User.findByIdAndUpdate(p.user, { $inc: { ridesCompleted: 1 } });
        // Notify passenger to rate
        await Notification.create({
          recipient: p.user,
          title: "Ride Completed! Rate Your Commute",
          message: `Your ride from ${ride.from} to ${ride.to} is marked complete. Please share feedback and rate your driver!`,
          type: "general",
          ride: ride._id,
        });
      }
    }

    // If ride is Cancelled by driver:
    if (status === "Cancelled") {
      for (const p of ride.passengers) {
        if (["Accepted", "Requested"].includes(p.status)) {
          await Notification.create({
            recipient: p.user,
            title: "Ride Cancelled by Driver ⚠️",
            message: `The ride from ${ride.from} to ${ride.to} has been cancelled by driver ${req.user.name}.`,
            type: "ride_cancelled",
            ride: ride._id,
          });
        }
      }
    }

    const populated = await Ride.findById(ride._id)
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .populate("passengers.user", "name phone department year isVerified");

    res.json({
      success: true,
      message: `Ride marked as ${status}`,
      ride: sanitizeRide(populated, req.user._id),
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
      .populate("passengers.user", "name phone department year prn rating isVerified verificationBadge")
      .sort({ departureTime: -1 });

    const sanitized = rides.map((r) => sanitizeRide(r, req.user._id));
    res.json({ success: true, count: sanitized.length, rides: sanitized });
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
      .populate("driver", "name phone department year rating ratingAvg ratingCount ridesCompleted isVerified verificationBadge")
      .sort({ departureTime: -1 });

    const sanitized = rides.map((r) => sanitizeRide(r, req.user._id));
    res.json({ success: true, count: sanitized.length, rides: sanitized });
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
  cancelRequest,
  updateRideStatus,
  getMyPublishedRides,
  getMyJoinedRides,
};
