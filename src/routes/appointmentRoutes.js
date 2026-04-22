const express = require("express");

const {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableAppointments,
  bookAppointment,
  getAppointments,
  getPatientAppointments,
  adminGetAllAppointments,
  adminDeleteAppointments,
} = require("../controllers/appointmentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

//Admin routes (GET all appointments, DELETE any appointment)
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin", "receptionist"),
  adminGetAllAppointments
);
router.delete(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  adminDeleteAppointments
);

// Doctor routes (GET, ADD, UPDATE, DELETE slots)
router.post("/add", protect, authorizeRoles("doctor"), createAppointment);
router.put("/:id", protect, authorizeRoles("doctor"), updateAppointment);
router.delete("/:id", protect, authorizeRoles("doctor"), deleteAppointment);
router.get("/", protect, authorizeRoles("doctor"), getAppointments);

// Patient routes (GET available slots, BOOK slot, GET booked slots)
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
