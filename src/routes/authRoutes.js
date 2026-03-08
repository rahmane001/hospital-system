const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, linkWallet, walletLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['doctor', 'patient', 'receptionist']).withMessage('Invalid role'),
  validate
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], login);

// MetaMask wallet authentication
router.post('/link-wallet', protect, linkWallet);
router.post('/wallet-login', walletLogin);

module.exports = router;
