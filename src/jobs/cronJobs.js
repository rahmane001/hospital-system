const cron = require("node-cron");
const Appointment = require("../models/Appointment");

// Schedule the cron job to run every minute

function startAppointmentCleanupJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Update appointments that are in the past and still marked as "available"
      const result = await Appointment.updateMany(
        { date: { $lt: now }, status: "available" },
        { $set: { status: "cancelled" } }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `${result.modifiedCount} appointments updated to cancelled`
        );
      }
    } catch (err) {
      console.error("Error in cron job:", err);
    }
  });
}

module.exports = startAppointmentCleanupJob;
