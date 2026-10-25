const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: [true, "Rating score (1-5) is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one rating per reviewer per reviewee per ride
ratingSchema.index({ ride: 1, fromUser: 1, toUser: 1 }, { unique: true });
ratingSchema.index({ toUser: 1, createdAt: -1 });

module.exports = mongoose.model("Rating", ratingSchema);
