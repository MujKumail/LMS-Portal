const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/mailer');

const ACCESS_SECRET = process.env.JWT_SECRET || 'super_secret_access_key_123!@#';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_987!@#';

// Token generation helpers
const generateAccessToken = (id) => {
  return jwt.sign({ id }, ACCESS_SECRET, { expiresIn: '1d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' });
};

// 1. REGISTER
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    // Trigger async welcome email
    sendWelcomeEmail(newUser).catch(err => console.error('Error sending welcome email:', err));

    const token = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to LMS Academy.',
      token,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials. Hashed password verification failed.' });
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful. Welcome back!',
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. REFRESH TOKEN ROTATION
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid session context.' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Session expired or refresh token invalid.' });
  }
};

// 4. FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter your email address.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email address.' });
    }

    // Mock reset token & action
    console.log(`🔑 [Forgot Password] Reset token triggered for: ${email}`);
    
    res.json({
      success: true,
      message: 'We have dispatched password recovery instructions to your email address.'
    });
  } catch (error) {
    next(error);
  }
};

// 5. GOOGLE OAUTH LOGIN (MOCK EXCHANGE)
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Google login payload missing required attributes.' });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'student', // Default role for new OAuth registrations
        avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
      });

      sendWelcomeEmail(user).catch(err => console.error('Error sending welcome email:', err));
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: isNewUser ? 'OAuth Registration successful!' : 'OAuth Login successful!',
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  googleLogin
};
