const Metric = require('../models/metricModel');

// Get recent overall metrics trends (all machines)
const getMetrics = async (req, res, next) => {
  const limit = req.query.limit || 50;
  try {
    const trends = await Metric.getRecentTrends(limit);
    res.json({ success: true, count: trends.length, data: trends });
  } catch (error) {
    next(error);
  }
};

// Get metrics history for a specific machine
const getMachineMetrics = async (req, res, next) => {
  const { machineId } = req.params;
  const limit = req.query.limit || 50;
  try {
    const metrics = await Metric.getByMachineId(machineId, limit);
    res.json({ success: true, count: metrics.length, data: metrics });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getMachineMetrics
};
