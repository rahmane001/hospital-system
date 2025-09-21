const app = require("./src/app");
const connectDB = require("./src/config/db");
const startAppointmentCleanupJob = require("./src/jobs/cronJobs");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

connectDB();

//
startAppointmentCleanupJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
