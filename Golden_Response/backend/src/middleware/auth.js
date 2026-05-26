const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_key_123!@#');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Strip out password and secure the object
    const userObj = JSON.parse(JSON.stringify(user));
    const { password, ...userWithoutPassword } = userObj;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
