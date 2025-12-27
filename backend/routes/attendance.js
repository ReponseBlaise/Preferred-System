// ============================================
// routes/attendance.js - TABLE-BASED
// ============================================

const express3 = require('express');
const router3 = express3.Router();
const attendanceController = require('../controllers/attendanceController');
const auth3 = require('../middleware/auth');
const roleCheck3 = require('../middleware/roleCheck');
const auditLog3 = require('../middleware/auditLog');

router3.use(auth3);

// Get attendance table for a date
router3.get('/table', attendanceController.getAttendanceTable);

// Bulk save attendance
router3.post('/bulk-save', roleCheck3('employee', 'manager'), auditLog3('CREATE', 'attendance'), attendanceController.bulkSaveAttendance);

// Get attendance history
router3.get('/history', attendanceController.getAttendanceHistory);

module.exports = router3;

