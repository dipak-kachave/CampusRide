const Rating = require("../models/Rating");
const Ride = require("../models/Ride");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Submit a review / rating after a completed ride
// @route   POST /api/ratings
// @access  Private (Driver or Accepted Passenger)
const createRating = async (req, res) => {
  try {
    const { rideId, toUserId, score, comment } = req.body;
    const reviewerId = req.user._id.toString();

    const numericScore = Number(score);
    if (!numericScore || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating score must be an integer between 1 and 5.",
      });
    }

    if (reviewerId === toUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot rate yourself.",
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    // STEP 4: Only allowed after ride is Completed
    if (ride.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Ratings can only be submitted after the ride is marked as Completed.",
      });
    }

    // STEP 4: Verify connection between driver and accepted passenger
    const isReviewerDriver = ride.driver.toString() === reviewerId;
    const isRevieweeDriver = ride.driver.toString() === toUserId.toString();

    const acceptedPassengerIds = ride.passengers
      .filter((p) => p.status === "Accepted")
      .map((p) => p.user.toString());

    const isReviewerAcceptedPassenger = acceptedPassengerIds.includes(reviewerId);
    const isRevieweeAcceptedPassenger = acceptedPassengerIds.includes(toUserId.toString());

    const validRelationship =
      (isReviewerDriver && isRevieweeAcceptedPassenger) ||
      (isReviewerAcceptedPassenger && isRevieweeDriver);

    if (!validRelationship) {
      return res.status(403).json({
        success: false,
        message:
          "Ratings are only permitted between the driver and accepted passengers of this completed ride.",
      });
    }

    // Upsert rating using unique index (ride, fromUser, toUser)
    const ratingDoc = await Rating.findOneAndUpdate(
      {
        ride: rideId,
        fromUser: req.user._id,
        toUser: toUserId,
      },
      {
        score: numericScore,
        comment: (comment || "").trim(),
        createdAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate average rating & rating count
    const allUserRatings = await Rating.find({ toUser: toUserId });
    const count = allUserRatings.length;
    const avg =
      count > 0
        ? Math.round((allUserRatings.reduce((sum, r) => sum + r.score, 0) / count) * 10) / 10
        : 5.0;

    await User.findByIdAndUpdate(toUserId, {
      ratingAvg: avg,
      rating: avg,
      ratingCount: count,
    });

    // Notify reviewee
    await Notification.create({
      recipient: toUserId,
      title: "New Rating Received ⭐",
      message: `${req.user.name} rated your ride ${numericScore} out of 5 stars.${comment ? ` Review: "${comment}"` : ""}`,
      type: "general",
      ride: ride._id,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Rating and feedback submitted successfully.",
      rating: ratingDoc,
      updatedRatingAvg: avg,
      updatedRatingCount: count,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a rating for this user on this ride.",
      });
    }
    console.error("Create Rating Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public trust profile for student/staff
// @route   GET /api/ratings/profile/:id
// @access  Public
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    // Fetch recent reviews (without private details)
    const recentReviews = await Rating.find({ toUser: user._id })
      .populate("fromUser", "name department year isVerified")
      .sort({ createdAt: -1 })
      .limit(10);

    const isVerified = user.isVerified || user.verificationStatus === "verified";

    // Strictly privacy compliant: NO phone number, NO idCardPhoto
    const publicProfile = {
      id: user._id,
      name: user.name,
      department: user.department,
      year: user.year,
      gender: user.gender || "Other",
      isVerified,
      verificationBadge: isVerified,
      verificationStatus: user.verificationStatus || (isVerified ? "verified" : "unverified"),
      ratingAvg: user.ratingAvg || user.rating || 5.0,
      ratingCount: user.ratingCount || 0,
      ridesCompleted: user.ridesCompleted || 0,
      cancellations: user.cancellationCount || 0,
      memberSince: user.createdAt,
      recentReviews: recentReviews.map((r) => ({
        id: r._id,
        score: r.score,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: {
          name: r.fromUser?.name || "Student",
          department: r.fromUser?.department || "",
          year: r.fromUser?.year || "",
        },
      })),
    };

    res.json({ success: true, profile: publicProfile });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRating,
  getPublicProfile,
};
