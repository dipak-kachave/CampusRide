const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seatsBooked: {
    type: Number,
    default: 1,
    min: 1,
    max: 4,
  },
  status: {
    type: String,
    enum: ["Requested", "Accepted", "Rejected"],
    default: "Requested",
  },
  pickupPoint: {
    type: String,
    default: "RCPIT Main Gate",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: [true, "Origin point is required (e.g. RCPIT Main Gate)"],
      trim: true,
      default: "RCPIT Main Gate",
    },
    to: {
      type: String,
      required: [true, "Destination is required (e.g. Shirpur Bus Stand)"],
      trim: true,
      default: "Shirpur Bus Stand",
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required (e.g. Today, 05:15 PM)"],
      trim: true,
    },
    seatsTotal: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      default: 2,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 2,
    },
    distanceKm: {
      type: Number,
      default: 3.2,
      min: 0,
    },
    ratePerKm: {
      type: Number,
      default: 12, // Updated to ₹12 per KM as requested
      min: 1,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      default: 20, // Calculated or custom fare
      min: 0,
    },
    vehicleInfo: {
      type: String,
      required: [true, "Vehicle details required (e.g. Honda Activa 6G)"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Full", "Completed", "Cancelled"],
      default: "Active",
    },
    passengers: [passengerSchema],
    notes: {
      type: String,
      default: "Leaving right after college hours. Safe riding guaranteed.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ride", rideSchema);
