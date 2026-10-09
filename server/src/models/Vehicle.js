const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Vehicle model name is required (e.g. Honda Activa 6G)"],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Registration number is required (e.g. MH-18-XX-1234)"],
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["Scooter", "Motorbike", "Electric Scooter", "Bicycle"],
      default: "Scooter",
    },
    ratePerKm: {
      type: Number,
      default: 12, // ₹12 per KM rule as requested
      min: [1, "Rate per KM must be at least ₹1"],
    },
    ratePerHour: {
      type: Number,
      default: 30, // Hourly fallback / cap
      min: 0,
    },
    location: {
      type: String,
      required: [true, "Pickup location is required (e.g. RCPIT Main Parking Stand)"],
      trim: true,
      default: "RCPIT Main Campus Parking",
    },
    status: {
      type: String,
      enum: ["Available", "Booked", "Under Maintenance", "Unavailable"],
      default: "Available",
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Electric", "Manual"],
      default: "Petrol",
    },
    helmetsProvided: {
      type: Number,
      default: 1,
      min: 0,
      max: 2,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "Well-maintained student vehicle for campus commutes.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
