const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const raw = req.headers.authorization.split(" ")[1];
    if (raw && raw !== "null" && raw !== "undefined" && raw.trim() !== "") {
      token = raw.trim();
    }
  } else if (req.query && req.query.token) {
    const raw = req.query.token;
    if (raw && raw !== "null" && raw !== "undefined" && raw.trim() !== "") {
      token = raw.trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please log in to perform this action (No authentication token provided)",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "campusride_rcpit_secret_key_2026_super_secure"
    );
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User account not found. Please log in again." });
    }

    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Your session has expired or is invalid. Please log in again.",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied: Admin only" });
  }
};

module.exports = { protect, adminOnly };
