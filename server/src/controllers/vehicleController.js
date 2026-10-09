const Vehicle = require("../models/Vehicle");

// @desc    Get all vehicles (with filters)
// @route   GET /api/vehicles
// @access  Public
const getAllVehicles = async (req, res) => {
  try {
    const { type, search, status } = req.query;
    let query = {};

    if (type && type !== "All") {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate("owner", "name phone department year rating isVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get Vehicles Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "owner",
      "name phone department year rating isVerified"
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register / Add a vehicle
// @route   POST /api/vehicles
// @access  Private (Logged-in Student/Staff)
const createVehicle = async (req, res) => {
  try {
    const {
      name,
      vehicleNumber,
      type,
      ratePerKm,
      ratePerHour,
      location,
      fuelType,
      helmetsProvided,
      description,
    } = req.body;

    if (!name || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Vehicle name and registration number are required",
      });
    }

    // Check if vehicle number already registered
    const exists = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "A vehicle with this registration number is already listed.",
      });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      name,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      type: type || "Scooter",
      ratePerKm: ratePerKm || 10, // Defaults to ₹10/KM
      ratePerHour: ratePerHour || 30,
      location: location || "RCPIT Main Campus Parking",
      fuelType: fuelType || "Petrol",
      helmetsProvided: helmetsProvided !== undefined ? helmetsProvided : 1,
      description: description || "Well-maintained student vehicle.",
      status: "Available",
    });

    const populated = await Vehicle.findById(vehicle._id).populate(
      "owner",
      "name phone department year"
    );

    res.status(201).json({
      success: true,
      message: "Vehicle listed successfully for campus rental at ₹10/km!",
      vehicle: populated,
    });
  } catch (error) {
    console.error("Create Vehicle Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vehicles listed by current logged-in user
// @route   GET /api/vehicles/my
// @access  Private
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle vehicle status (Available / Unavailable)
// @route   PUT /api/vehicles/:id/status
// @access  Private (Owner Only)
const toggleVehicleStatus = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    // Check owner
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this vehicle",
      });
    }

    const newStatus = req.body.status || (vehicle.status === "Available" ? "Unavailable" : "Available");
    vehicle.status = newStatus;
    await vehicle.save();

    res.json({
      success: true,
      message: `Vehicle status updated to ${newStatus}`,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  getMyVehicles,
  toggleVehicleStatus,
};
