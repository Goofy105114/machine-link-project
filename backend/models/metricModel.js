const db = require('../config/db');

const Metric = {
  // Add telemetry reading
  create: async ({ machine_id, temperature, rpm, voltage, current }) => {
    try {
      const [result] = await db.query(
        'INSERT INTO machine_metrics (machine_id, temperature, rpm, voltage, current) VALUES (?, ?, ?, ?, ?)',
        [machine_id, temperature, rpm, voltage, current]
      );
      return { id: result.insertId, machine_id, temperature, rpm, voltage, current };
    } catch (error) {
      throw error;
    }
  },

  // Get metrics for a specific machine
  getByMachineId: async (machineId, limit = 50) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM machine_metrics WHERE machine_id = ? ORDER BY created_at DESC LIMIT ?',
        [machineId, parseInt(limit, 10)]
      );
      // Return in chronological order for charting
      return rows.reverse();
    } catch (error) {
      throw error;
    }
  },

  // Get the latest metric reading for a machine
  getLatestByMachineId: async (machineId) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM machine_metrics WHERE machine_id = ? ORDER BY created_at DESC LIMIT 1',
        [machineId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Get average metrics for all machines combined (or latest average)
  getAverages: async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          COALESCE(AVG(temperature), 0) as avg_temp, 
          COALESCE(AVG(rpm), 0) as avg_rpm 
        FROM (
          SELECT m1.* 
          FROM machine_metrics m1
          INNER JOIN (
            SELECT machine_id, MAX(created_at) as max_created
            FROM machine_metrics
            GROUP BY machine_id
          ) m2 ON m1.machine_id = m2.machine_id AND m1.created_at = m2.max_created
        ) latest_metrics
      `);
      return rows[0] || { avg_temp: 0, avg_rpm: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Fetch recent metrics for all machines to build a unified trend chart
  getRecentTrends: async (limit = 20) => {
    try {
      // Get the last N records overall or grouped
      const [rows] = await db.query(`
        SELECT mm.*, m.machine_name 
        FROM machine_metrics mm
        JOIN machines m ON mm.machine_id = m.id
        ORDER BY mm.created_at DESC
        LIMIT ?
      `, [parseInt(limit, 10)]);
      return rows.reverse();
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Metric;
