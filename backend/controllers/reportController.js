
// ============================================
// controllers/reportController.js - PROJECT-SCOPED
// ============================================

const db2 = require('../config/database');
const { generatePayrollPDF, generateInventoryPDF } = require('../utils/generatePDF');
const { generatePayrollExcel, generateInventoryExcel } = require('../utils/generateExcel');

// Generate project payroll report
exports.generateProjectPayrollReport = async (req, res) => {
    try {
        const { project_id, start_date, end_date, format } = req.query;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        if (!start_date || !end_date) {
            return res.status(400).json({ 
                error: { message: 'start_date and end_date are required' } 
            });
        }

        // Verify access
        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        // Get project info
        const projectInfo = await db2.query(
            'SELECT project_name, project_code, location FROM projects WHERE id = $1',
            [project_id]
        );

        if (projectInfo.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Project not found' } });
        }

        // Get payroll data
        const query = `
            SELECT 
                e.id,
                e.full_name,
                e.position,
                e.rate_per_day,
                COUNT(a.id) as days_worked,
                SUM(a.hours_worked) as total_hours,
                SUM(a.hours_worked * e.rate_per_day) as total_amount
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id 
                AND a.attendance_date BETWEEN $2 AND $3
            WHERE e.project_id = $1 AND e.is_active = true
            GROUP BY e.id, e.full_name, e.position, e.rate_per_day
            HAVING COUNT(a.id) > 0
            ORDER BY e.full_name
        `;

        const result = await db2.query(query, [project_id, start_date, end_date]);

        // Calculate period details
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const daysDifference = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

        const periodInfo = {
            project_name: projectInfo.rows[0].project_name,
            project_code: projectInfo.rows[0].project_code,
            location: projectInfo.rows[0].location,
            start_date,
            end_date,
            days_in_period: daysDifference,
            period_type: daysDifference <= 7 ? 'Weekly' : daysDifference <= 14 ? 'Bi-Weekly' : 'Custom Period'
        };

        if (format === 'pdf') {
            const pdfBuffer = await generatePayrollPDF(result.rows, periodInfo);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payroll-${projectInfo.rows[0].project_code}-${start_date}-to-${end_date}.pdf`);
            return res.send(pdfBuffer);
        } else if (format === 'excel') {
            const excelBuffer = await generatePayrollExcel(result.rows, periodInfo);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=payroll-${projectInfo.rows[0].project_code}-${start_date}-to-${end_date}.xlsx`);
            return res.send(excelBuffer);
        } else {
            res.json({
                success: true,
                project: periodInfo,
                data: result.rows,
                summary: {
                    total_employees: result.rows.length,
                    total_days_worked: result.rows.reduce((sum, row) => sum + parseInt(row.days_worked), 0),
                    total_amount: result.rows.reduce((sum, row) => sum + parseFloat(row.total_amount), 0)
                }
            });
        }
    } catch (error) {
        console.error('Payroll report error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Generate project inventory report
exports.generateProjectInventoryReport = async (req, res) => {
    try {
        const { project_id, format } = req.query;

        if (!project_id) {
            return res.status(400).json({ error: { message: 'project_id is required' } });
        }

        // Verify access
        const hasAccess = await db2.query(
            'SELECT user_has_project_access($1, $2) as has_access',
            [req.user.id, project_id]
        );

        if (!hasAccess.rows[0].has_access) {
            return res.status(403).json({ error: { message: 'Access denied to this project' } });
        }

        // Get project info
        const projectInfo = await db2.query(
            'SELECT project_name, project_code, location FROM projects WHERE id = $1',
            [project_id]
        );

        if (projectInfo.rows.length === 0) {
            return res.status(404).json({ error: { message: 'Project not found' } });
        }

        const result = await db2.query(`
            SELECT 
                id,
                item_name,
                description,
                quantity,
                unit,
                unit_price,
                total_value,
                category,
                created_at
            FROM inventory 
            WHERE project_id = $1
            ORDER BY category, item_name
        `, [project_id]);

        // Calculate summary
        const summary = await db2.query(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                SUM(total_value) as total_value
            FROM inventory
            WHERE project_id = $1
        `, [project_id]);

        const reportData = {
            ...projectInfo.rows[0],
            ...summary.rows[0]
        };

        if (format === 'pdf') {
            const pdfBuffer = await generateInventoryPDF(result.rows, reportData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=inventory-${projectInfo.rows[0].project_code}.pdf`);
            return res.send(pdfBuffer);
        } else if (format === 'excel') {
            const excelBuffer = await generateInventoryExcel(result.rows, reportData);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=inventory-${projectInfo.rows[0].project_code}.xlsx`);
            return res.send(excelBuffer);
        } else {
            res.json({
                success: true,
                project: projectInfo.rows[0],
                data: result.rows,
                summary: summary.rows[0]
            });
        }
    } catch (error) {
        console.error('Inventory report error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};
