
// ============================================
// routes/projects.js - NEW
// ============================================

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.use(auth);

// Get user's projects
router.get('/my-projects', projectController.getUserProjects);

// Get all projects (Manager only)
router.get('/', roleCheck('manager'), projectController.getAllProjects);

// Create project (Manager only)
router.post('/', roleCheck('manager'), auditLog('CREATE', 'projects'), projectController.createProject);

// Assign user to project (Manager only)
router.post('/assign', roleCheck('manager'), auditLog('CREATE', 'project_assignments'), projectController.assignUserToProject);

// Get project statistics
router.get('/:project_id/stats', projectController.getProjectStats);

module.exports = router;