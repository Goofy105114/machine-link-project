const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

router.get('/', getAlerts);
router.put('/:id/resolve', authorize('admin'), resolveAlert); // Only admin can resolve alerts manually

module.exports = router;
