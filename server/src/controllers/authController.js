const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "campusride_rcpit_secret_key_2026_super_secure",
    { expiresIn: "30d" }
  );
};

// Helper to format safe user profile for responses (Never expose private idCardPhoto path)
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender || "Other",
    prn: user.prn,
    department: user.department,
    year: user.year,
    role: user.role,
    isVerified: user.isVerified || user.verificationStatus === "verified",
    verificationBadge: user.verificationBadge || user.isVerified || user.verificationStatus === "verified",
    verificationStatus: user.verificationStatus || (user.isVerified ? "verified" : "unverified"),
    verificationMethod: user.verificationMethod,
    hasIdCardPhoto: Boolean(user.idCardPhoto),
    rejectionReason: user.rejectionReason || "",
    ratingAvg: user.ratingAvg || user.rating || 5.0,
    rating: user.ratingAvg || user.rating || 5.0,
    ratingCount: user.ratingCount || 0,
    ridesCompleted: user.ridesCompleted || 0,
    cancellationCount: user.cancellationCount || 0,
    isSuspended: Boolean(user.isSuspended),
    suspendedReason: user.suspendedReason || "",
  };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      prn,
      department,
      year,
      role,
      idCardImage,
      idCardVerified,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (Name, Email, Password, Phone)",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    const validGender = ["Female", "Male", "Other"].includes(gender) ? gender : "Other";
    const isRcpitEmail = cleanEmail.endsWith("@rcpit.ac.in");

    let isVerified = false;
    let verificationBadge = false;
    let verificationStatus = "unverified";
    let verificationMethod = "pending";

    if (idCardVerified || (idCardImage && prn && prn.trim().length >= 4)) {
      isVerified = true;
      verificationBadge = true;
      verificationStatus = "verified";
      verificationMethod = "id_card_scan";
    } else if (isRcpitEmail) {
      isVerified = true;
      verificationBadge = true;
      verificationStatus = "verified";
      verificationMethod = "institutional_email";
    } else if (prn && prn.trim().length >= 4) {
      isVerified = true;
      verificationBadge = true;
      verificationStatus = "verified";
      verificationMethod = "college_prn";
    }

    // Create user
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      phone,
      gender: validGender,
      prn: prn ? prn.trim() : "",
      department: department || "Computer Engineering",
      year: year || "2nd Year",
      role: role === "staff" ? "staff" : "student",
      isVerified,
      verificationBadge,
      verificationStatus,
      verificationMethod,
      idCardImage: idCardImage || "",
      idCardVerified: !!idCardVerified,
    });

    res.status(201).json({
      success: true,
      message: isVerified
        ? "Registration successful! Your RCPIT profile is verified."
        : "Registration successful! Please verify your student ID card to publish or join rides.",
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload ID card photo for student/staff verification
// @route   POST /api/auth/upload-id-card
// @access  Private
const uploadIdCardPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload a JPG or PNG (max 2 MB).",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.idCardPhoto = req.file.filename;
    user.verificationStatus = "pending";
    user.rejectionReason = "";
    await user.save();

    res.json({
      success: true,
      message: "ID card uploaded successfully! Your verification is now pending admin review.",
      verificationStatus: "pending",
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Upload ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  uploadIdCardPhoto,
  formatUserResponse,
};
