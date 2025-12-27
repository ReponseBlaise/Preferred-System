
// ============================================
// controllers/attendanceController.js - TABLE-BASED ATTENDANCE
// ============================================

const db3 = require('../config/database');

// Get employees for attendance table (for a specific date)
exports.getAttendanceTable = async (req, res) => {
    try {
        const { project_id, attendance_date } = req.query;

        if (!project_id || !attendance_date) {
            return res.status(400).json({ 
                error: { message: 'project_id and attendance_date are required' } 
            });
        }

        // Verify access
        const hasAccess = await db3.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        // Get all active employees with their attendance for the date
        const query = `
            SELECT 
                e.id as employee_id,
                e.full_name,
                e.position,
                e.rate_per_day,
                a.id as attendance_id,
                a.status,
                a.hours_worked,
                a.comment,
                COALESCE(a.status, 'absent') as attendance_status,
                COALESCE(a.hours_worked, 0) as attendance_hours
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = $2
            WHERE e.project_id = $1 AND e.is_active = true
            ORDER BY e.full_name
        `;

        const result = await db3.query(query, [project_id, attendance_date]);

        res.json({
            success: true,
            count: result.rows.length,
            date: attendance_date,
            data: result.rows
        });
    } catch (error) {
        console.error('Get attendance table error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Bulk save attendance (from table)
exports.bulkSaveAttendance = async (req, res) => {
    try {
        const { project_id, attendance_date, attendance_records } = req.body;

        // Verify access
        const hasAccess = await db3.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        // Begin transaction
        await db3.query('BEGIN');

        try {
            for (const record of attendance_records) {
                const { employee_id, status, hours_worked, comment } = record;

                // Upsert attendance record
                await db3.query(
                    `INSERT INTO attendance (project_id, employee_id, attendance_date, status, hours_worked, comment, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (employee_id, attendance_date)
                     DO UPDATE SET 
                        status = $4,
                        hours_worked = $5,
                        comment = $6`,
                    [project_id, employee_id, attendance_date, status, hours_worked, comment, req.user.id]
                );
            }

            await db3.query('COMMIT');

            res.json({
                success: true,
                message: 'Attendance saved successfully',
                records_saved: attendance_records.length
            });
        } catch (error) {
            await db3.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Bulk save attendance error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Get attendance history
exports.getAttendanceHistory = async (req, res) => {
    try {
        const { project_id, start_date, end_date, employee_id } = req.query;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db3.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        let query = `
            SELECT 
                a.id,
                a.attendance_date,
                a.status,
                a.hours_worked,
                a.comment,
                e.full_name,
                e.position,
                e.rate_per_day
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.project_id = $1
        `;
        const params = [project_id];
        let paramCount = 2;

        if (start_date) {
            query += ` AND a.attendance_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND a.attendance_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (employee_id) {
            query += ` AND a.employee_id = $${paramCount}`;
            params.push(employee_id);
        }

        query += ' ORDER BY a.attendance_date DESC, e.full_name';

        const result = await db3.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Get attendance history error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};
