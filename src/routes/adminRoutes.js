const express = require('express');
const router = express.Router();
const { createAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only existing admins can create new admin accounts
router.post('/create-admin', protect, admin, createAdmin);

module.exports = router;
