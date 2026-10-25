const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    gender: {
      type: String,
      enum: ["Female", "Male", "Other"],
      default: "Other",
    },
    prn: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      default: "Computer Engineering",
    },
    year: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Staff"],
      default: "2nd Year",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required for ride coordination"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationBadge: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verificationMethod: {
      type: String,
      enum: ["institutional_email", "college_prn", "id_card_scan", "admin_approved", "pending"],
      default: "pending",
    },
    idCardPhoto: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    idCardImage: {
      type: String,
      default: "",
    },
    idCardVerified: {
      type: Boolean,
      default: false,
    },
    ratingAvg: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ridesCompleted: {
      type: Number,
      default: 0,
    },
    cancellationCount: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      default: "",
    },
    warningCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ verificationStatus: 1 });
userSchema.index({ ratingAvg: 1, ratingCount: 1 });
userSchema.index({ cancellationCount: 1 });

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("isVerified")) {
    this.verificationBadge = this.isVerified;
    if (this.isVerified && this.verificationStatus !== "verified") {
      this.verificationStatus = "verified";
    }
  }
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
