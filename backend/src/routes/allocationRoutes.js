const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const {
  createAllocation,
  getAllAllocations,
  getAllocationsByEmployee,
  updateAllocation,
  deleteAllocation,
  checkEmployeeAvailability
} = require('../controllers/allocationController');

router.use(protect);

router.get('/check-availability', allowRoles('admin', 'manager'), checkEmployeeAvailability);

router.post('/', allowRoles('admin', 'manager'), createAllocation);
router.get('/', allowRoles('admin', 'manager'), getAllAllocations);
router.get('/employee/:employeeId', getAllocationsByEmployee);
router.put('/:id', allowRoles('admin', 'manager'), updateAllocation);
router.delete('/:id', allowRoles('admin', 'manager'), deleteAllocation);

module.exports = router;