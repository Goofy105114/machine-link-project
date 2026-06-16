const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    // Check for user
    const user = await User.findByUsername(username);
    if (!user) {
      logger.warn(`Failed login attempt for username: ${username} (User not found)`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password_hash);
    if (!isMatch) {
      logger.warn(`Failed login attempt for username: ${username} (Incorrect password)`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'machinelink_secret_jwt_key_2026',
      { expiresIn: '30d' }
    );

    logger.info(`User authenticated successfully: ${username}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
