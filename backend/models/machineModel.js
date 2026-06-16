const db = require('../config/db');

const Machine = {
  // Fetch all machines
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM machines ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Fetch machine by ID
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM machines WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Create a new machine
  create: async ({ machine_name, status, location }) => {
    try {
      const [result] = await db.query(
        'INSERT INTO machines (machine_name, status, location) VALUES (?, ?, ?)',
        [machine_name, status || 'Offline', location]
      );
      return { id: result.insertId, machine_name, status: status || 'Offline', location };
    } catch (error) {
      throw error;
    }
  },

  // Update machine details
  update: async (id, { machine_name, status, location }) => {
    try {
      await db.query(
        'UPDATE machines SET machine_name = ?, status = ?, location = ? WHERE id = ?',
        [machine_name, status, location, id]
      );
      return { id, machine_name, status, location };
    } catch (error) {
      throw error;
    }
  },

  // Update status only (e.g. from simulator)
  updateStatus: async (id, status) => {
    try {
      await db.query('UPDATE machines SET status = ? WHERE id = ?', [status, id]);
      return { id, status };
    } catch (error) {
      throw error;
    }
  },

  // Delete a machine
  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM machines WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Machine;
