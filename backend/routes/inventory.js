// ============================================
// routes/inventory.js - UPDATED
// ============================================

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.use(auth);

// Inventory routes - ALL project-scoped
router.get('/', inventoryController.getProjectInventory);
router.post('/', roleCheck('storeman', 'manager'), auditLog('CREATE', 'inventory'), inventoryController.createInventoryItem);
router.put('/:id', roleCheck('storeman', 'manager'), auditLog('UPDATE', 'inventory'), inventoryController.updateInventoryItem);
router.delete('/:id', roleCheck('manager'), auditLog('DELETE', 'inventory'), inventoryController.deleteInventoryItem);

// Expense routes - project-scoped
router.get('/expenses', inventoryController.getProjectExpenses);
router.post('/expenses', roleCheck('storeman', 'manager'), auditLog('CREATE', 'expenses'), inventoryController.createExpense);

module.exports = router;