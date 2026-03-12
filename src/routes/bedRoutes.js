const express = require("express");
const router = express.Router();
const { getBeds, getBedsByDepartment, createBed, assignBed, releaseBed, updateBedStatus } = require("../controllers/bedController");
const { protect, admin, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, getBeds);
router.get("/department/:deptId", protect, getBedsByDepartment);
router.post("/", protect, admin, createBed);
router.put("/assign/:id", protect, authorizeRoles("admin", "receptionist"), assignBed);
router.put("/release/:id", protect, authorizeRoles("admin", "receptionist"), releaseBed);
router.put("/status/:id", protect, admin, updateBedStatus);

module.exports = router;