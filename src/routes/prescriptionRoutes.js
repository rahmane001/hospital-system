// ============================================
// src/routes/prescriptionRoutes.js
// ============================================
const express = require("express");
const router = express.Router();
const { createPrescription, getMyPrescriptions, getDoctorPrescriptions, getAllPrescriptions } = require("../controllers/prescriptionController");
const { protect, admin, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("doctor"), createPrescription);
router.get("/my", protect, authorizeRoles("patient"), getMyPrescriptions);
router.get("/doctor", protect, authorizeRoles("doctor"), getDoctorPrescriptions);
router.get("/admin", protect, admin, getAllPrescriptions);

module.exports = router;