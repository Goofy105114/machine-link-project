const db = require('../config/db');

const Alert = {
  // Create a new alert
  create: async ({ machine_id, message, severity }) => {
    try {
      const [result] = await db.query(
        'INSERT INTO alerts (machine_id, message, severity, resolved) VALUES (?, ?, ?, 0)',
        [machine_id, message, severity || 'Info']
      );
      return { id: result.insertId, machine_id, message, severity, resolved: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Get all unresolved alerts
  getActive: async () => {
    try {
      const [rows] = await db.query(`
        SELECT a.*, m.machine_name 
        FROM alerts a
        JOIN machines m ON a.machine_id = m.id
        WHERE a.resolved = 0
        ORDER BY a.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get all alerts (both active and resolved)
  getAll: async (limit = 100) => {
    try {
      const [rows] = await db.query(`
        SELECT a.*, m.machine_name 
        FROM alerts a
        JOIN machines m ON a.machine_id = m.id
        ORDER BY a.created_at DESC
        LIMIT ?
      `, [parseInt(limit, 10)]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Resolve a specific alert
  resolve: async (id) => {
    try {
      await db.query('UPDATE alerts SET resolved = 1 WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Resolve all active alerts for a machine
  resolveAllForMachine: async (machineId) => {
    try {
      await db.query('UPDATE alerts SET resolved = 1 WHERE machine_id = ? AND resolved = 0', [machineId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Alert;
