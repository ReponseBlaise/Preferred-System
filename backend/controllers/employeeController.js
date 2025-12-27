
// ============================================
// controllers/employeeController.js - UPDATED FOR MULTI-PROJECT
// ============================================

const db2 = require('../config/database');

// Get employees for a project
exports.getProjectEmployees = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { is_active, search } = req.query;

        // Verify access
        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        let query = 'SELECT * FROM employees WHERE project_id = $1';
        const params = [project_id];
        let paramCount = 2;

        if (is_active !== undefined) {
            query += ` AND is_active = $${paramCount}`;
            params.push(is_active === 'true');
            paramCount++;
        }

        if (search) {
            query += ` AND (full_name ILIKE $${paramCount} OR position ILIKE $${paramCount} OR phone_number ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY full_name';

        const result = await db2.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Create employee
exports.createEmployee = async (req, res) => {
    try {
        const { project_id, full_name, phone_number, position, rate_per_day } = req.body;

        // Verify access
        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        const result = await db2.query(
            `INSERT INTO employees (project_id, full_name, phone_number, position, rate_per_day, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [project_id, full_name, phone_number, position, rate_per_day, req.user.id]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone_number, position, rate_per_day } = req.body;

        // Verify access to employee's project
        const employee = await db2.query('SELECT project_id FROM employees WHERE id = $1', [id]);
        if (employee.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Employee not found' } });
        }

        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, employee.rows[0].project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied' } });
        }

        const result = await db2.query(
            `UPDATE employees 
             SET full_name = $1, phone_number = $2, position = $3, rate_per_day = $4 
             WHERE id = $5 RETURNING *`,
            [full_name, phone_number, position, rate_per_day, id]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify access
        const employee = await db2.query('SELECT project_id FROM employees WHERE id = $1', [id]);
        if (employee.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Employee not found' } });
        }

        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, employee.rows[0].project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied' } });
        }

        const result = await db2.query(
            'UPDATE employees SET is_active = false WHERE id = $1 RETURNING *',
            [id]
        );

        res.json({
            success: true,
            message: 'Employee deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};