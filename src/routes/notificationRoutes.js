// ============================================
// src/routes/notificationRoutes.js
// ============================================

const express = require("express");
const router = express.Router();
const { getMyNotifications, markRead, getUnreadCount } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.get("/unread", protect, getUnreadCount);
router.put("/read", protect, markRead);

module.exports = router;