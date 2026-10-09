const express = require("express");
const router = express.Router();
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require("../controllers/busController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllBuses);
router.get("/:id", getBusById);
router.post("/", protect, createBus);
router.put("/:id", protect, updateBus);
router.delete("/:id", protect, deleteBus);

module.exports = router;
