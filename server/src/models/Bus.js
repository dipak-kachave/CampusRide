const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      default: "",
    },
    origin: {
      type: String,
      default: "Shirpur Bus Stand",
    },
    destination: {
      type: String,
      required: [true, "Destination is required (e.g. Dhule, Jalgaon, Nashik)"],
      trim: true,
    },
    departure: {
      type: String,
      required: [true, "Departure time is required (e.g. 06:30 AM)"],
      trim: true,
    },
    arrivalTime: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "MSRTC Ordinary",
        "MSRTC Express",
        "MSRTC Semi-Luxury (Asian)",
        "Shivshahi AC",
        "Sleeper / Night Bus",
      ],
      default: "MSRTC Express",
    },
    platform: {
      type: String,
      default: "Platform 1",
    },
    fare: {
      type: String,
      default: "₹60 approx",
    },
    frequency: {
      type: String,
      default: "Every 45 mins",
    },
    via: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: String,
      default: "Today, 08:00 AM",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);
