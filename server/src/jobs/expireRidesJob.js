const cron = require("node-cron");
const Ride = require("../models/Ride");

function startExpireRidesJob() {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();
      const result = await Ride.updateMany(
        {
          status: { $in: ["Active", "Full"] },
          departureTime: { $lte: now },
        },
        {
          $set: { status: "Expired" },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Job] Marked ${result.modifiedCount} passed ride(s) as Expired at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error("[Job] Error expiring rides:", err);
    }
  });

  console.log("[Job] Scheduled ride expiration job (every 10 minutes)");
}

module.exports = startExpireRidesJob;
