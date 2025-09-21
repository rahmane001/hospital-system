const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, admin, getUsers); //admin only can get all users

router.get("/:id", protect, admin, getUserById); //admin only can get user by id

router.put("/:id", protect, admin, updateUser); //admin and (user itself : will added soon)  can update user by id

router.delete("/:id", protect, admin, deleteUser); //admin only can delete user by id

module.exports = router;
