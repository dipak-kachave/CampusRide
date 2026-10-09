const Bus = require("../models/Bus");

// @desc    Get all bus timetables with search
// @route   GET /api/buses
// @access  Public
const getAllBuses = async (req, res) => {
  try {
    const { destination, type, search } = req.query;
    let query = { isActive: true };

    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }
    if (type && type !== "All") {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { destination: { $regex: search, $options: "i" } },
        { via: { $regex: search, $options: "i" } },
        { platform: { $regex: search, $options: "i" } },
      ];
    }

    const buses = await Bus.find(query).sort({ departure: 1 });

    res.json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get Buses Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new bus schedule
// @route   POST /api/buses
// @access  Private
const createBus = async (req, res) => {
  try {
    const { destination, departure, arrivalTime, type, platform, fare, frequency, via, lastUpdated } = req.body;

    if (!destination || !departure) {
      return res.status(400).json({
        success: false,
        message: "Destination and Departure time are required",
      });
    }

    const bus = await Bus.create({
      destination,
      departure,
      arrivalTime: arrivalTime || "",
      type: type || "MSRTC Express",
      platform: platform || "Platform 1",
      fare: fare || "₹60 approx",
      frequency: frequency || "Every hour",
      via: via || "",
      lastUpdated: lastUpdated || "Just now",
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Bus timetable entry added successfully!",
      bus,
    });
  } catch (error) {
    console.error("Create Bus Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bus schedule
// @route   PUT /api/buses/:id
// @access  Private
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: "Updated recently" },
      { new: true, runValidators: true }
    );

    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    res.json({ success: true, message: "Bus schedule updated", bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete bus entry
// @route   DELETE /api/buses/:id
// @access  Private
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });
    res.json({ success: true, message: "Bus schedule deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};
