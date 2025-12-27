const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, authorize } = require('../middleware/auth');
const payrollController = require('../controllers/payrollController');

// Validation middleware
const validatePayrollGeneration = [
  body('period_start').isISO8601(),
  body('period_end').isISO8601()
];

// All routes require authentication
router.use(authMiddleware);

// Only manager can manage payroll
router.post('/generate', authorize('manager'), validatePayrollGeneration, payrollController.generatePayroll);
router.get('/', payrollController.getPayrolls);
router.get('/export', payrollController.exportPayrollExcel);
router.get('/:periodStart/:periodEnd', payrollController.getPayrollByPeriod);
router.put('/:id/mark-paid', authorize('manager'), payrollController.markAsPaid);
router.get('/employee/:employeeId', payrollController.getEmployeePayrollHistory);

module.exports = router;