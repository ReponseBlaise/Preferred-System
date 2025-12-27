
// ============================================
// controllers/dashboardController.js
// ============================================

const db4 = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        // Total Active Employees
        const employeeCount = await db4.query('SELECT COUNT(*) FROM employees WHERE is_active = true');
        
        // Today's Attendance
        const todayAttendance = await db4.query(
            "SELECT COUNT(*) FROM attendance WHERE attendance_date = CURRENT_DATE"
        );
        
        // Total Inventory Value
        const inventoryValue = await db4.query('SELECT COALESCE(SUM(total_value), 0) as total FROM inventory');
        
        // This Month's Expenses
        const monthExpenses = await db4.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
             WHERE EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );
        
        // Pending Requests
        const pendingRequests = await db4.query(
            "SELECT COUNT(*) FROM requests WHERE status = 'pending'"
        );
        
        // This Month's Payroll
        const monthPayroll = await db4.query(
            `SELECT COALESCE(SUM(a.hours_worked * e.rate_per_day), 0) as total
             FROM attendance a
             JOIN employees e ON a.employee_id = e.id
             WHERE EXTRACT(MONTH FROM a.attendance_date) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM a.attendance_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );

        // Recent Activities
        const recentActivities = await db4.query(
            `SELECT action, table_name, created_at, u.full_name as user_name
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY created_at DESC
             LIMIT 10`
        );

        res.json({
            success: true,
            data: {
                totalEmployees: parseInt(employeeCount.rows[0].count),
                todayAttendance: parseInt(todayAttendance.rows[0].count),
                inventoryValue: parseFloat(inventoryValue.rows[0].total),
                monthExpenses: parseFloat(monthExpenses.rows[0].total),
                pendingRequests: parseInt(pendingRequests.rows[0].count),
                monthPayroll: parseFloat(monthPayroll.rows[0].total),
                recentActivities: recentActivities.rows
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const result = await db4.query(
            `SELECT al.*, u.full_name as user_name
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await db4.query('SELECT COUNT(*) FROM audit_logs');

        res.json({
            success: true,
            count: result.rows.length,
            total: parseInt(countResult.rows[0].count),
            data: result.rows
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};