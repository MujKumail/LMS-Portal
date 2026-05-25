const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  googleLogin
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Public authentication endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/refresh-token', refreshToken);
router.post('/google-login', googleLogin);

module.exports = router;
