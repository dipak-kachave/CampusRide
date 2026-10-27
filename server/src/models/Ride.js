const mongoose = require("mongoose");
const campusConfig = require("../config/campus");

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
    enum: ["Requested", "Accepted", "Rejected", "Cancelled"],
    default: "Requested",
  },
  pickupPoint: {
    type: String,
    trim: true,
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
      required: [true, "Origin pickup point is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Destination pickup point is required"],
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, "Departure time is required"],
    },
    seatsTotal: {
      type: Number,
      required: true,
      min: 1,
      max: campusConfig.maxSeats,
      default: 2,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0,
      max: campusConfig.maxSeats,
      default: 2,
    },
    distanceKm: {
      type: Number,
      default: 3.2,
      min: 0,
    },
    ratePerKm: {
      type: Number,
      default: 12,
      min: 1,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      min: campusConfig.minPricePerSeat,
      max: campusConfig.maxPricePerSeat,
      default: 20,
    },
    vehicleInfo: {
      type: String,
      required: [true, "Vehicle details required (e.g. Honda Activa 6G)"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Full", "Completed", "Cancelled", "Expired"],
      default: "Active",
    },
    passengers: [passengerSchema],
    womenOnly: {
      type: Boolean,
      default: false,
    },
    luggageAllowed: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "Leaving right after college hours. Safe riding guaranteed.",
    },
  },
  {
    timestamps: true,
  }
);

rideSchema.index({ departureTime: 1, status: 1 });
rideSchema.index({ from: 1, to: 1, status: 1 });
rideSchema.index({ driver: 1, status: 1 });

module.exports = mongoose.model("Ride", rideSchema);
