const Report = require("../models/Report");

// @desc    Submit a safety complaint / report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { reportedUser, reportedUserId, ride, reason, text, description, subject, targetType } =
      req.body;

    const reportText = (text || description || "").trim();
    if (!reportText) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed explanation of the safety or conduct issue.",
      });
    }

    const validReasons = [
      "Inappropriate Behavior",
      "Unsafe Driving",
      "No Show",
      "Overcharging / Payment Demand",
      "Harassment",
      "Fake Information",
      "Other",
    ];

    const selectedReason = validReasons.includes(reason) ? reason : "Other";

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser: reportedUser || reportedUserId || null,
      ride: ride || null,
      reason: selectedReason,
      targetType: targetType || (ride ? "Ride" : reportedUser ? "User" : "General / Safety"),
      subject: subject || `${selectedReason} Report`,
      description: reportText,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Report submitted successfully. The CampusRide safety moderator will review it shortly.",
      report,
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private (Admin)
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy", "name email phone department year isVerified")
      .populate("reportedUser", "name email phone department year isVerified isSuspended warningCount")
      .populate("ride", "from to departureTime pricePerSeat vehicleInfo")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id
// @access  Private (Admin)
const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes: adminNotes || "",
        actionTaken: actionTaken || "None",
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    res.json({ success: true, message: `Report marked as ${status}`, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
};
