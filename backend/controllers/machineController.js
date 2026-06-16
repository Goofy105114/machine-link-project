const Machine = require('../models/machineModel');
const Metric = require('../models/metricModel');
const logger = require('../utils/logger');

// Get all machines
const getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.getAll();
    
    // Attach latest metrics to each machine in the list
    const machinesWithMetrics = await Promise.all(
      machines.map(async (machine) => {
        const latestMetric = await Metric.getLatestByMachineId(machine.id);
        return {
          ...machine,
          metrics: latestMetric || {
            temperature: 0,
            rpm: 0,
            voltage: 0,
            current: 0,
            created_at: null
          }
        };
      })
    );

    res.json({ success: true, count: machinesWithMetrics.length, data: machinesWithMetrics });
  } catch (error) {
    next(error);
  }
};

// Get machine by ID
const getMachineById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const machine = await Machine.getById(id);
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine with ID ${id} not found` });
    }

    const latestMetric = await Metric.getLatestByMachineId(id);
    const historicalMetrics = await Metric.getByMachineId(id, 20);

    res.json({
      success: true,
      data: {
        ...machine,
        metrics: latestMetric || {
          temperature: 0,
          rpm: 0,
          voltage: 0,
          current: 0,
          created_at: null
        },
        history: historicalMetrics
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a machine
const createMachine = async (req, res, next) => {
  const { machine_name, status, location } = req.body;
  try {
    if (!machine_name || !location) {
      return res.status(400).json({ success: false, message: 'Please provide machine name and location' });
    }

    const machine = await Machine.create({ machine_name, status, location });
    logger.info(`Machine created: ${machine_name} (ID: ${machine.id})`);
    res.status(201).json({ success: true, data: machine });
  } catch (error) {
    next(error);
  }
};

// Update a machine
const updateMachine = async (req, res, next) => {
  const { id } = req.params;
  const { machine_name, status, location } = req.body;
  try {
    const machineExists = await Machine.getById(id);
    if (!machineExists) {
      return res.status(404).json({ success: false, message: `Machine with ID ${id} not found` });
    }

    if (!machine_name || !status || !location) {
      return res.status(400).json({ success: false, message: 'Please provide machine name, status, and location' });
    }

    const updated = await Machine.update(id, { machine_name, status, location });
    logger.info(`Machine updated: ID ${id}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete a machine
const deleteMachine = async (req, res, next) => {
  const { id } = req.params;
  try {
    const machineExists = await Machine.getById(id);
    if (!machineExists) {
      return res.status(404).json({ success: false, message: `Machine with ID ${id} not found` });
    }

    await Machine.delete(id);
    logger.info(`Machine deleted: ID ${id}`);
    res.json({ success: true, message: `Machine with ID ${id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine
};
