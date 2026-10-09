const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: "*", // allow all in dev
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/rentals", require("./routes/rentalRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/buses", require("./routes/busRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CampusRide API",
    institution: "R. C. Patel Institute of Technology (RCPIT), Shirpur",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  CampusRide API Server running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
