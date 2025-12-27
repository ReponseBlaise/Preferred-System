

// ============================================
// routes/employees.js - UPDATED
// ============================================

const express2 = require('express');
const router2 = express2.Router();
const employeeController = require('../controllers/employeeController');
const auth2 = require('../middleware/auth');
const roleCheck2 = require('../middleware/roleCheck');
const auditLog2 = require('../middleware/auditLog');

router2.use(auth2);

// Get project employees
router2.get('/project/:project_id', employeeController.getProjectEmployees);

// Create employee
router2.post('/', roleCheck2('employee', 'manager'), auditLog2('CREATE', 'employees'), employeeController.createEmployee);

// Update employee
router2.put('/:id', roleCheck2('employee', 'manager'), auditLog2('UPDATE', 'employees'), employeeController.updateEmployee);

// Delete employee
router2.delete('/:id', roleCheck2('manager'), auditLog2('DELETE', 'employees'), employeeController.deleteEmployee);

module.exports = router2;