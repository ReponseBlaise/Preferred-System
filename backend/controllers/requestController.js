
// ============================================
// controllers/requestController.js
// ============================================

const db5 = require('../config/database');

// Get all requests
exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT r.*, u.full_name as requester_name, u.email as requester_email
            FROM requests r
            JOIN users u ON r.requester_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND r.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        // If not manager, only show own requests
        if (req.user.role !== 'manager') {
            query += ` AND r.requester_id = $${paramCount}`;
            params.push(req.user.id);
        }

        query += ' ORDER BY r.created_at DESC';

        const result = await db5.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Create request
exports.createRequest = async (req, res) => {
    try {
        const { request_type, subject, message, attachment_url } = req.body;

        const result = await db5.query(
            `INSERT INTO requests (requester_id, request_type, subject, message, attachment_url) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, request_type, subject, message, attachment_url]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Update request (Manager response)
exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, response } = req.body;

        const result = await db5.query(
            `UPDATE requests 
             SET status = $1, response = $2, responded_by = $3, responded_at = CURRENT_TIMESTAMP 
             WHERE id = $4 RETURNING *`,
            [status, response, req.user.id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Request not found' } });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

module.exports = {
    // Employee
    getAllEmployees: exports.getAllEmployees,
    getEmployee: exports.getEmployee,
    createEmployee: exports.createEmployee,
    updateEmployee: exports.updateEmployee,
    deleteEmployee: exports.deleteEmployee,
    // Attendance
    getAttendance: exports.getAttendance,
    recordAttendance: exports.recordAttendance,
    updateAttendance: exports.updateAttendance,
    deleteAttendance: exports.deleteAttendance,
    // Inventory
    getAllInventory: exports.getAllInventory,
    getInventoryItem: exports.getInventoryItem,
    createInventoryItem: exports.createInventoryItem,
    updateInventoryItem: exports.updateInventoryItem,
    deleteInventoryItem: exports.deleteInventoryItem,
    getAllExpenses: exports.getAllExpenses,
    createExpense: exports.createExpense,
    // Dashboard
    getDashboardStats: exports.getDashboardStats,
    getAuditLogs: exports.getAuditLogs,
    // Requests
    getAllRequests: exports.getAllRequests,
    createRequest: exports.createRequest,
    updateRequest: exports.updateRequest
};