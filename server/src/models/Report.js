const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetType: {
      type: String,
      enum: ["Ride", "Vehicle", "User", "General / Safety"],
      default: "General / Safety",
    },
    subject: {
      type: String,
      required: [true, "Report subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved", "Dismissed"],
      default: "Pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
