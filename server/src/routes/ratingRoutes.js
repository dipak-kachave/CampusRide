const express = require("express");
const router = express.Router();
const { createRating, getPublicProfile } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRating);
router.get("/profile/:id", getPublicProfile);

module.exports = router;
