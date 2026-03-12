// ============================================
// src/routes/departmentRoutes.js
// ============================================
const express = require("express");
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, getDepartments);
router.post("/", protect, admin, createDepartment);
router.put("/:id", protect, admin, updateDepartment);
router.delete("/:id", protect, admin, deleteDepartment);

module.exports = router;