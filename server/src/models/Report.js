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
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
    reason: {
      type: String,
      enum: [
        "Inappropriate Behavior",
        "Unsafe Driving",
        "No Show",
        "Overcharging / Payment Demand",
        "Harassment",
        "Fake Information",
        "Other",
      ],
      default: "Other",
    },
    targetType: {
      type: String,
      enum: ["Ride", "Vehicle", "User", "General / Safety"],
      default: "General / Safety",
    },
    subject: {
      type: String,
      trim: true,
      default: "Safety Report",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved", "Dismissed"],
      default: "Pending",
    },
    actionTaken: {
      type: String,
      enum: ["None", "Warning Issued", "User Suspended", "Dismissed"],
      default: "None",
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

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });

module.exports = mongoose.model("Report", reportSchema);
