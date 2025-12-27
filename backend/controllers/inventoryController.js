// ============================================
// controllers/inventoryController.js - PROJECT-SCOPED
// ============================================

const db = require('../config/database');

// Get inventory for a project
exports.getProjectInventory = async (req, res) => {
    try {
        const { project_id, category, search } = req.query;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        let query = 'SELECT * FROM inventory WHERE project_id = $1';
        const params = [project_id];
        let paramCount = 2;

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (search) {
            query += ` AND (item_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Create inventory item
exports.createInventoryItem = async (req, res) => {
    try {
        const { project_id, item_name, description, quantity, unit, unit_price, category } = req.body;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        const result = await db.query(
            `INSERT INTO inventory (project_id, item_name, description, quantity, unit, unit_price, category, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [project_id, item_name, description, quantity, unit, unit_price, category, req.user.id]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create inventory error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, description, quantity, unit, unit_price, category } = req.body;

        // Verify access to item's project
        const item = await db.query('SELECT project_id FROM inventory WHERE id = $1', [id]);
        if (item.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Item not found' } });
        }

        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, item.rows[0].project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied' } });
        }

        const result = await db.query(
            `UPDATE inventory 
             SET item_name = $1, description = $2, quantity = $3, unit = $4, unit_price = $5, category = $6 
             WHERE id = $7 RETURNING *`,
            [item_name, description, quantity, unit, unit_price, category, id]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify access
        const item = await db.query('SELECT project_id FROM inventory WHERE id = $1', [id]);
        if (item.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Item not found' } });
        }

        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, item.rows[0].project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied' } });
        }

        const result = await db.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Delete inventory error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Get project expenses
exports.getProjectExpenses = async (req, res) => {
    try {
        const { project_id, start_date, end_date, category } = req.query;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        let query = 'SELECT * FROM expenses WHERE project_id = $1';
        const params = [project_id];
        let paramCount = 2;

        if (start_date) {
            query += ` AND expense_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND expense_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
        }

        query += ' ORDER BY expense_date DESC';

        const result = await db.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Create expense
exports.createExpense = async (req, res) => {
    try {
        const { project_id, expense_type, description, amount, expense_date, receipt_number, category } = req.body;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        const result = await db.query(
            `INSERT INTO expenses (project_id, expense_type, description, amount, expense_date, receipt_number, category, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [project_id, expense_type, description, amount, expense_date, receipt_number, category, req.user.id]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

