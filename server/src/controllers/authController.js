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

// @desc    Register new user (Supports both @rcpit.ac.in and personal emails with PRN proof)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, prn, department, year, role, idCardImage, idCardVerified } = req.body;

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

    // Determine verification proof:
    // 1. If scanned ID card verified -> id_card_scan
    // 2. If institutional email (@rcpit.ac.in) -> Automatic verification
    // 3. If personal email (e.g. Gmail) -> Verified via College PRN / Roll number proof or uploaded ID Card
    const isRcpitEmail = cleanEmail.endsWith("@rcpit.ac.in");
    let isVerified = false;
    let verificationBadge = false;
    let verificationMethod = "pending";

    if (idCardVerified || (idCardImage && prn && prn.trim().length >= 4)) {
      isVerified = true;
      verificationBadge = true;
      verificationMethod = "id_card_scan";
    } else if (isRcpitEmail) {
      isVerified = true;
      verificationBadge = true;
      verificationMethod = "institutional_email";
    } else if (prn && prn.trim().length >= 4) {
      // Personal email with college PRN entered as proof
      isVerified = true;
      verificationBadge = true;
      verificationMethod = "college_prn";
    } else {
      // Personal email without PRN proof -> can register, but status remains pending
      isVerified = false;
      verificationBadge = false;
      verificationMethod = "pending";
    }

    // Create user
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      phone,
      prn: prn ? prn.trim() : "",
      department: department || "Computer Engineering",
      year: year || "2nd Year",
      role: role === "staff" ? "staff" : "student",
      isVerified,
      verificationBadge,
      verificationMethod,
      idCardImage: idCardImage || "",
      idCardVerified: !!idCardVerified,
    });

    res.status(201).json({
      success: true,
      message: isVerified
        ? (verificationMethod === "id_card_scan"
            ? "Registration successful! Your College ID Card has been scanned & verified."
            : "Registration successful! Your RCPIT profile is verified.")
        : "Registration successful! Please submit your College PRN or ID card to complete verification.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        prn: user.prn,
        department: user.department,
        year: user.year,
        role: user.role,
        isVerified: user.isVerified,
        verificationBadge: user.verificationBadge,
        verificationMethod: user.verificationMethod,
        idCardImage: user.idCardImage,
        idCardVerified: user.idCardVerified,
        rating: user.rating,
      },
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

    // Check for user (explicitly selecting password)
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        prn: user.prn,
        department: user.department,
        year: user.year,
        role: user.role,
        isVerified: user.isVerified,
        verificationBadge: user.verificationBadge,
        verificationMethod: user.verificationMethod,
        idCardImage: user.idCardImage,
        idCardVerified: user.idCardVerified,
        rating: user.rating,
      },
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
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
