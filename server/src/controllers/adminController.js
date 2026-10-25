const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Ride = require("../models/Ride");
const RentalBooking = require("../models/RentalBooking");
const Report = require("../models/Report");
const Bus = require("../models/Bus");
const Notification = require("../models/Notification");
const campusConfig = require("../config/campus");

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [
      usersCount,
      pendingVerificationCount,
      ridesCount,
      activeRidesCount,
      completedRidesCount,
      reportsCount,
      busesCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ verificationStatus: "pending" }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: "Active" }),
      Ride.countDocuments({ status: "Completed" }),
      Report.countDocuments({ status: "Pending" }),
      Bus.countDocuments(),
    ]);

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
        pendingVerifications: pendingVerificationCount,
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
    // Return users sorted so pending verifications come first, then newest
    const users = await User.find({})
      .select("-password")
      .sort({
        verificationStatus: 1, // "pending" comes before "verified"
        createdAt: -1,
      });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Serve private ID card photo securely to authenticated admin
// @route   GET /api/admin/users/:id/id-card-photo
// @access  Private (Admin Only)
const getIdCardPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check private photo file
    if (user.idCardPhoto) {
      const filePath = path.join(__dirname, "../../private_uploads/idcards", user.idCardPhoto);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    // Fallback: if legacy user uploaded base64 in idCardImage
    if (user.idCardImage && user.idCardImage.startsWith("data:image")) {
      const matches = user.idCardImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const type = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        res.set("Content-Type", type);
        return res.send(buffer);
      }
    }

    return res.status(404).json({ success: false, message: "No ID card photo available for this user" });
  } catch (err) {
    console.error("Serve ID photo error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve or reject student ID card verification
// @route   PUT /api/admin/users/:id/verify-decision
// @access  Private (Admin Only)
const verifyDecision = async (req, res) => {
  try {
    const { decision, reason } = req.body; // "approve" | "reject"
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (decision === "approve") {
      user.isVerified = true;
      user.verificationBadge = true;
      user.verificationStatus = "verified";
      user.verificationMethod = "admin_approved";
      user.rejectionReason = "";
      await user.save();

      await Notification.create({
        recipient: user._id,
        title: "RCPIT Student Verification Approved! ✅",
        message:
          "Your student ID card has been verified by the administrator. You now have full access to publish campus rides and request seats.",
        type: "verification",
      });
    } else {
      user.isVerified = false;
      user.verificationBadge = false;
      user.verificationStatus = "rejected";
      user.rejectionReason = reason || "ID photo was blurry, unreadable, or did not match student details.";
      await user.save();

      await Notification.create({
        recipient: user._id,
        title: "ID Verification Rejected ❌",
        message: `Your ID verification could not be approved. Reason: ${user.rejectionReason}. Please re-upload a clear photo of your ID card.`,
        type: "verification",
      });
    }

    res.json({
      success: true,
      message: `User verification status updated to ${user.verificationStatus}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all ride-sharing activity
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

// @desc    Get flagged users queue (high cancellations, low ratings, suspended)
// @route   GET /api/admin/flagged-users
// @access  Private (Admin)
const getFlaggedUsersAdmin = async (req, res) => {
  try {
    const threshold = campusConfig.cancellationFlagThreshold || 3;
    const flagged = await User.find({
      $or: [
        { cancellationCount: { $gte: threshold } },
        { $and: [{ ratingCount: { $gte: 5 } }, { ratingAvg: { $lt: 3.0 } }] },
        { isSuspended: true },
      ],
    }).select("-password");

    res.json({
      success: true,
      count: flagged.length,
      threshold,
      users: flagged,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate user (warn, suspend, reinstate)
// @route   PUT /api/admin/users/:id/action
// @access  Private (Admin)
const moderateUserAction = async (req, res) => {
  try {
    const { action, reason } = req.body; // "warn" | "suspend" | "reinstate"
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === "warn") {
      user.warningCount = (user.warningCount || 0) + 1;
      await user.save();

      await Notification.create({
        recipient: user._id,
        title: "CampusRide Official Warning ⚠️",
        message: `You have received a safety warning from the administrator: ${reason || "Violation of campus ride-sharing policies (frequent cancellations, low ratings, or conduct reports)."}. Repeated warnings may result in account suspension.`,
        type: "report",
      });
    } else if (action === "suspend") {
      user.isSuspended = true;
      user.suspendedReason = reason || "Account suspended due to policy violations.";
      await user.save();

      await Notification.create({
        recipient: user._id,
        title: "Account Suspended 🛑",
        message: `Your CampusRide account has been suspended by the administrator. Reason: ${user.suspendedReason}. You cannot publish rides or reserve seats.`,
        type: "report",
      });
    } else if (action === "reinstate") {
      user.isSuspended = false;
      user.suspendedReason = "";
      await user.save();

      await Notification.create({
        recipient: user._id,
        title: "Account Reinstated ✅",
        message: "Your CampusRide account suspension has been lifted. You can now use all campus mobility features.",
        type: "general",
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use warn, suspend, or reinstate." });
    }

    res.json({
      success: true,
      message: `Action '${action}' applied to user ${user.name}.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user verification status (quick toggle)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = !user.isVerified;
    user.verificationBadge = user.isVerified;
    user.verificationStatus = user.isVerified ? "verified" : "unverified";
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

module.exports = {
  getAdminStats,
  getAllUsersAdmin,
  getIdCardPhoto,
  verifyDecision,
  getAllRidesAdmin,
  getFlaggedUsersAdmin,
  moderateUserAction,
  toggleUserVerification,
};
