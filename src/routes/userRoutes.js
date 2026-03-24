const express = require("express");
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    approveDoctor,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, admin, getUserById);
router.put('/approve-doctor/:id', protect, admin, approveDoctor);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
