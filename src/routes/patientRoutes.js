const express = require("express");
const {
    createPatientProfile,
    getPatientProfile,
    updatePatientProfile,
    deletePatientProfile,
} = require("../controllers/patientController");

const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createPatientProfile);

router.get("/:id", protect, getPatientProfile);

router.put("/:id", protect, updatePatientProfile);

router.delete("/:id", protect, admin, deletePatientProfile);

module.exports = router;
