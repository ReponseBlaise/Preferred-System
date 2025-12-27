
// ============================================
// routes/dashboard.js
// ============================================

const express5 = require('express');
const router5 = express5.Router();
const dashboardController = require('../controllers/dashboardController');
const auth5 = require('../middleware/auth');
const roleCheck5 = require('../middleware/roleCheck');

router5.use(auth5);

router5.get('/stats', roleCheck5('manager'), dashboardController.getDashboardStats);
router5.get('/audit-logs', roleCheck5('manager'), dashboardController.getAuditLogs);

module.exports = router5;
