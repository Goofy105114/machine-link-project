const Machine = require('../models/machineModel');
const Metric = require('../models/metricModel');
const Alert = require('../models/alertModel');

const getStats = async (req, res, next) => {
  try {
    const machines = await Machine.getAll();
    const activeAlerts = await Alert.getActive();
    const averages = await Metric.getAverages();

    let total = machines.length;
    let active = 0;
    let offline = 0;
    let maintenance = 0;

    machines.forEach((machine) => {
      if (machine.status === 'Active') active++;
      else if (machine.status === 'Offline') offline++;
      else if (machine.status === 'Maintenance') maintenance++;
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalMachines: total,
          activeMachines: active,
          offlineMachines: offline,
          maintenanceMachines: maintenance,
          averageTemperature: parseFloat(parseFloat(averages.avg_temp).toFixed(2)),
          averageRpm: Math.round(averages.avg_rpm),
          activeAlertsCount: activeAlerts.length
        },
        statusDistribution: [
          { name: 'Active', value: active, color: '#10B981' },
          { name: 'Offline', value: offline, color: '#EF4444' },
          { name: 'Maintenance', value: maintenance, color: '#F59E0B' }
        ],
        recentAlerts: activeAlerts.slice(0, 5) // Return up to 5 most recent active alerts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
