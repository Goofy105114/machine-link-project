const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const db = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/userModel');
const Machine = require('./models/machineModel');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use(morgan('dev'));

// Route imports
const authRoutes = require('./routes/authRoutes');
const machineRoutes = require('./routes/machineRoutes');
const metricRoutes = require('./routes/metricRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Server
async function startServer() {
  logger.info('Initializing MachineLink Backend Server...');
  
  // Test connection to the database
  let dbConnected = false;
  let retryCount = 0;
  const maxRetries = 10;
  
  while (!dbConnected && retryCount < maxRetries) {
    dbConnected = await db.testConnection();
    if (!dbConnected) {
      retryCount++;
      logger.warn(`Database connection attempt ${retryCount} failed. Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  if (!dbConnected) {
    logger.error('Could not establish connection to the database. Exiting application.');
    process.exit(1);
  }

  // Auto-seed admin user if none exists (just in case)
  try {
    const adminUser = await User.findByUsername('admin');
    if (!adminUser) {
      logger.info('Admin user not found. Seeding default admin user (admin / admin123)...');
      await User.create({
        username: 'admin',
        email: 'admin@machinelink.io',
        password: 'admin123',
        role: 'admin'
      });
      logger.info('Default admin user seeded successfully.');
    }
  } catch (err) {
    logger.error('Error checking/seeding default admin user:', err.message);
  }

  // Auto-seed default machines if table is empty
  try {
    const machines = await Machine.getAll();
    if (machines.length === 0) {
      logger.info('No machines found. Seeding default factory machines...');
      await Machine.create({ machine_name: 'CNC Milling Machine Alpha', status: 'Active', location: 'Assembly Line A' });
      await Machine.create({ machine_name: 'Robotic Welding Arm Beta', status: 'Active', location: 'Welding Cell 2' });
      await Machine.create({ machine_name: 'Injection Molding Gamma', status: 'Maintenance', location: 'Plastic Molding Dept' });
      await Machine.create({ machine_name: 'Hydraulic Press Delta', status: 'Offline', location: 'Heavy Press Shop' });
      await Machine.create({ machine_name: 'Packaging Conveyor Epsilon', status: 'Active', location: 'Packaging Line 1' });
      logger.info('Default machines seeded successfully.');
    }
  } catch (err) {
    logger.error('Error seeding default machines:', err.message);
  }

  // Start Telemetry Simulator
  const { startSimulator } = require('./services/telemetrySimulator');
  startSimulator();

  // Start Listening
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer();
