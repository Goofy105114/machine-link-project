const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find a user by username
  findByUsername: async (username) => {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user
  create: async ({ username, email, password, role }) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, role || 'operator']
      );
      return { id: result.insertId, username, email, role: role || 'operator' };
    } catch (error) {
      throw error;
    }
  },

  // Verify password helper
  comparePassword: async (inputPassword, storedHash) => {
    return await bcrypt.compare(inputPassword, storedHash);
  }
};

module.exports = User;
