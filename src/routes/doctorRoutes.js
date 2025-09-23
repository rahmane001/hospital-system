const express = require("express");
const {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    deleteDoctorProfile,
} = require("../controllers/doctorController");

const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createDoctorProfile);

router.get("/:id", protect, getDoctorProfile);

router.put("/:id", protect, updateDoctorProfile);

router.delete("/:id", protect, admin, deleteDoctorProfile);

module.exports = router;
