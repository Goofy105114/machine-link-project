const express = require('express');
const router = express.Router();
const { getMetrics, getMachineMetrics } = require('../controllers/metricController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

router.get('/', getMetrics);
router.get('/:machineId', getMachineMetrics);

module.exports = router;
