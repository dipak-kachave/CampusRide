const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Ride = require("../models/Ride");
const RentalBooking = require("../models/RentalBooking");
const Report = require("../models/Report");
const Bus = require("../models/Bus");

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [usersCount, ridesCount, activeRidesCount, completedRidesCount, reportsCount, busesCount] =
      await Promise.all([
        User.countDocuments(),
        Ride.countDocuments(),
        Ride.countDocuments({ status: "Active" }),
        Ride.countDocuments({ status: "Completed" }),
        Report.countDocuments({ status: "Pending" }),
        Bus.countDocuments(),
      ]);

    // Calculate how many total passenger bookings have been made
    const allRides = await Ride.find({}).select("passengers seatsTotal seatsAvailable");
    let totalPassengerBookings = 0;
    let acceptedPassengers = 0;
    allRides.forEach((r) => {
      if (r.passengers && r.passengers.length > 0) {
        totalPassengerBookings += r.passengers.length;
        acceptedPassengers += r.passengers.filter((p) => p.status === "Accepted").length;
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers: usersCount,
        totalRides: ridesCount,
        activeRides: activeRidesCount,
        completedRides: completedRidesCount,
        totalSeatRequests: totalPassengerBookings,
        acceptedSeats: acceptedPassengers,
        pendingReports: reportsCount,
        totalBuses: busesCount,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all ride-sharing activity (Who published rides, who requested/booked)
// @route   GET /api/admin/rides
// @access  Private (Admin)
const getAllRidesAdmin = async (req, res) => {
  try {
    const rides = await Ride.find({})
      .populate("driver", "name email phone department year prn isVerified rating")
      .populate("passengers.user", "name email phone department year prn isVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("Admin rides error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = !user.isVerified;
    user.verificationBadge = user.isVerified;
    if (user.isVerified) user.verificationMethod = "admin_approved";
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} verification status set to ${user.isVerified}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle vehicle approval
// @route   PUT /api/admin/vehicles/:id/approve
// @access  Private (Admin)
const toggleVehicleApproval = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    vehicle.isApprovedByAdmin = !vehicle.isApprovedByAdmin;
    await vehicle.save();

    res.json({
      success: true,
      message: `Vehicle ${vehicle.name} approval set to ${vehicle.isApprovedByAdmin}`,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsersAdmin,
  getAllRidesAdmin,
  toggleUserVerification,
  toggleVehicleApproval,
};
