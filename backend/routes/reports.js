

// ============================================
// routes/reports.js - UPDATED
// ============================================

const express2 = require('express');
const router2 = express2.Router();
const reportController = require('../controllers/reportController');
const auth2 = require('../middleware/auth');
const roleCheck2 = require('../middleware/roleCheck');

router2.use(auth2);

router2.get('/payroll', reportController.generateProjectPayrollReport);
router2.get('/inventory', roleCheck2('manager', 'storeman'), reportController.generateProjectInventoryReport);

module.exports = router2;
