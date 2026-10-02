const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeRole
} = require('../controllers/employeeController');

router.use(protect);

router.get('/', allowRoles('admin', 'manager'), getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', allowRoles('admin'), createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', allowRoles('admin'), deleteEmployee);
router.patch('/:id/role', allowRoles('admin'), updateEmployeeRole);

module.exports = router;