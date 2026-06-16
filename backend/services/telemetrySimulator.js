const Machine = require('../models/machineModel');
const Metric = require('../models/metricModel');
const Alert = require('../models/alertModel');
const logger = require('../utils/logger');
const db = require('../config/db');

// Threshold constants
const TEMP_THRESHOLD = 85.0;
const RPM_THRESHOLD = 4500;

const runSimulationStep = async () => {
  try {
    const machines = await Machine.getAll();
    if (machines.length === 0) {
      logger.info('Simulator: No machines found in database to simulate.');
      return;
    }

    for (const machine of machines) {
      let currentStatus = machine.status;
      let newStatus = currentStatus;

      // Status transition probabilities
      const rand = Math.random();
      if (currentStatus === 'Active') {
        if (rand < 0.03) {
          newStatus = 'Offline';
        } else if (rand < 0.05) {
          newStatus = 'Maintenance';
        }
      } else if (currentStatus === 'Offline') {
        if (rand < 0.10) {
          newStatus = 'Active';
        }
      } else if (currentStatus === 'Maintenance') {
        if (rand < 0.10) {
          newStatus = 'Active';
        }
      }

      // Update status in DB if changed
      if (newStatus !== currentStatus) {
        await Machine.updateStatus(machine.id, newStatus);
        logger.info(`Simulator: Machine "${machine.machine_name}" transitioned from ${currentStatus} to ${newStatus}`);
      }

      // Generate realistic metrics based on status
      let temperature = 22.0;
      let rpm = 0;
      let voltage = 0.0;
      let current = 0.0;

      if (newStatus === 'Active') {
        // Normally runs around 65-78°C, but occasionally spikes
        const isSpike = Math.random() < 0.08;
        temperature = isSpike 
          ? 86.0 + Math.random() * 8.0  // 86 to 94 °C
          : 62.0 + Math.random() * 16.0; // 62 to 78 °C

        // Normally runs around 3000-3800 RPM, occasionally spikes
        const isRpmSpike = Math.random() < 0.08;
        rpm = isRpmSpike
          ? 4501 + Math.floor(Math.random() * 800) // 4501 to 5300 RPM
          : 2800 + Math.floor(Math.random() * 1100); // 2800 to 3900 RPM

        voltage = 395.0 + Math.random() * 15.0; // 395V to 410V
        current = 12.0 + Math.random() * 8.0;   // 12A to 20A
      } else if (newStatus === 'Maintenance') {
        // Low load state
        temperature = 42.0 + Math.random() * 8.0;  // 42 to 50 °C
        rpm = 400 + Math.floor(Math.random() * 600); // 400 to 1000 RPM
        voltage = 220.0 + Math.random() * 10.0;   // 220V to 230V
        current = 1.5 + Math.random() * 2.0;      // 1.5A to 3.5A
      } else {
        // Offline: drops to ambient temperature and 0s
        temperature = 21.0 + Math.random() * 4.0;  // 21 to 25 °C
        rpm = 0;
        voltage = 0.0;
        current = 0.0;
      }

      // Format decimals
      temperature = parseFloat(temperature.toFixed(2));
      voltage = parseFloat(voltage.toFixed(2));
      current = parseFloat(current.toFixed(2));

      // Save metrics
      await Metric.create({
        machine_id: machine.id,
        temperature,
        rpm,
        voltage,
        current
      });

      // --- Alert checks ---

      // 1. Temperature Alert
      if (temperature > TEMP_THRESHOLD) {
        // Check if there's already an active temp alert for this machine
        const [existing] = await db.query(
          "SELECT id FROM alerts WHERE machine_id = ? AND resolved = 0 AND message LIKE 'Temperature%'",
          [machine.id]
        );
        if (existing.length === 0) {
          const msg = `Temperature anomaly detected on ${machine.machine_name}: ${temperature}°C`;
          await Alert.create({
            machine_id: machine.id,
            message: msg,
            severity: 'Critical'
          });
          logger.warn(`Simulator Alert: ${msg}`);
        }
      }

      // 2. RPM Alert
      if (rpm > RPM_THRESHOLD) {
        const [existing] = await db.query(
          "SELECT id FROM alerts WHERE machine_id = ? AND resolved = 0 AND message LIKE 'RPM%'",
          [machine.id]
        );
        if (existing.length === 0) {
          const msg = `RPM anomaly detected on ${machine.machine_name}: ${rpm} RPM`;
          await Alert.create({
            machine_id: machine.id,
            message: msg,
            severity: 'Warning'
          });
          logger.warn(`Simulator Alert: ${msg}`);
        }
      }

      // 3. Offline Status Alert
      if (newStatus === 'Offline') {
        const [existing] = await db.query(
          "SELECT id FROM alerts WHERE machine_id = ? AND resolved = 0 AND message LIKE '%Offline%'",
          [machine.id]
        );
        if (existing.length === 0) {
          const msg = `Machine ${machine.machine_name} has gone Offline`;
          await Alert.create({
            machine_id: machine.id,
            message: msg,
            severity: 'Warning'
          });
          logger.warn(`Simulator Alert: ${msg}`);
        }
      }

      // 4. Recovery / Alert Resolution
      // If machine is Active or Maintenance and its parameters are within acceptable thresholds,
      // resolve active alerts automatically
      if (newStatus !== 'Offline' && temperature <= TEMP_THRESHOLD && rpm <= RPM_THRESHOLD) {
        const [existing] = await db.query(
          "SELECT id FROM alerts WHERE machine_id = ? AND resolved = 0",
          [machine.id]
        );
        if (existing.length > 0) {
          await Alert.resolveAllForMachine(machine.id);
          logger.info(`Simulator: Machine ${machine.machine_name} returned to normal. Resolved active alerts.`);
        }
      }
    }
  } catch (error) {
    logger.error('Error in telemetry simulation loop:', error);
  }
};

const startSimulator = () => {
  logger.info('Starting telemetry simulator service (Interval: 5s)...');
  // Run once immediately
  runSimulationStep();
  // Set interval
  setInterval(runSimulationStep, 5000);
};

module.exports = {
  startSimulator
};
