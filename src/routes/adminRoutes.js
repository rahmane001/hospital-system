const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { createAdmin } = require('../controllers/adminController');

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin);

module.exports = router;
