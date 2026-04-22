const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getMyBills,
  getDoctorBills,
  payBill,
  getAdminAllBills,
} = require("../controllers/billController");

const router = express.Router();

//patient (view his Bills , pay Bill)
router.get("/my", protect, authorizeRoles("patient"), getMyBills);
router.post("/pay/:id", protect, authorizeRoles("patient"), payBill);

//doctor (view his patients Bills)
router.get("/doctor", protect, authorizeRoles("doctor"), getDoctorBills);

//admin + receptionist (view all Bills)
router.get("/admin", protect, authorizeRoles("admin", "receptionist"), getAdminAllBills);
module.exports = router;
