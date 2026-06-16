const Alert = require('../models/alertModel');
const logger = require('../utils/logger');

// Get all alerts (supports ?active=true query param)
const getAlerts = async (req, res, next) => {
  const activeOnly = req.query.active === 'true';
  const limit = req.query.limit || 50;

  try {
    let alerts;
    if (activeOnly) {
      alerts = await Alert.getActive();
    } else {
      alerts = await Alert.getAll(limit);
    }

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// Resolve an alert
const resolveAlert = async (req, res, next) => {
  const { id } = req.params;
  try {
    const success = await Alert.resolve(id);
    if (!success) {
      return res.status(404).json({ success: false, message: `Alert with ID ${id} not found` });
    }

    logger.info(`Alert resolved: ID ${id}`);
    res.json({ success: true, message: `Alert with ID ${id} resolved successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  resolveAlert
};
