const express = require("express");

const {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableAppointments,
  bookAppointment,
  getAppointments,
  getPatientAppointments,
} = require("../controllers/appointmentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
//i need to make sure when the appointment be in the past it will be deleted or changed to not available

// Doctor routes (GET, ADD, UPDATE, DELETE slots)
router.post("/add", protect, authorizeRoles("doctor"), createAppointment);
router.put("/:id", protect, authorizeRoles("doctor"), updateAppointment);
router.delete("/:id", protect, authorizeRoles("doctor"), deleteAppointment);
router.get("/", protect, authorizeRoles("doctor"), getAppointments);

// Patient routes
router.get(
  "/available/:doctorId",
  protect,
  authorizeRoles("patient"),
  getAvailableAppointments
);
router.post("/book/:id", protect, authorizeRoles("patient"), bookAppointment);
router.get(
  "/booked",
  protect,
  authorizeRoles("patient"),
  getPatientAppointments
);
module.exports = router;
