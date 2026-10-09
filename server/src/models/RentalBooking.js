const mongoose = require("mongoose");

const rentalBookingSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destinationOrPurpose: {
      type: String,
      default: "Shirpur Bus Stand / Town Commute",
    },
    estimatedHours: {
      type: Number,
      default: 2,
    },
    estimatedKm: {
      type: Number,
      default: 10,
    },
    startKm: {
      type: Number,
      default: null,
    },
    endKm: {
      type: Number,
      default: null,
    },
    totalKm: {
      type: Number,
      default: 0,
    },
    ratePerKm: {
      type: Number,
      default: 12, // ₹12 per KM rule
    },
    totalAmount: {
      type: Number,
      default: 0, // Calculated on trip completion: (totalKm * ratePerKm)
    },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "Active", "Completed", "Cancelled", "Rejected"],
      default: "Requested",
    },
    pickupOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit OTP
    },
    dropOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit OTP
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid (Cash/UPI)"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RentalBooking", rentalBookingSchema);
