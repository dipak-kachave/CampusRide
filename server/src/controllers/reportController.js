const Report = require("../models/Report");

// @desc    Submit a safety complaint / report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { targetType, subject, description, reportedUserId } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and Description are required",
      });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser: reportedUserId || null,
      targetType: targetType || "General / Safety",
      subject,
      description,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Report submitted to RCPIT CampusRide admin successfully. We will investigate promptly.",
      report,
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy", "name email phone department")
      .populate("reportedUser", "name email phone department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id
// @access  Private
const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
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
