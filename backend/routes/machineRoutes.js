const express = require('express');
const router = express.Router();
const {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

router.route('/')
  .get(getMachines)
  .post(authorize('admin'), createMachine);

router.route('/:id')
  .get(getMachineById)
  .put(authorize('admin'), updateMachine)
  .delete(authorize('admin'), deleteMachine);

module.exports = router;
