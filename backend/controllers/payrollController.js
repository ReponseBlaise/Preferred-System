const db = require('../config/database');
const ExcelJS = require('exceljs');

// Generate payroll
exports.generatePayroll = async (req, res) => {
  try {
    const { period_start, period_end } = req.body;
    
    // Calculate attendance for each employee in the period
    const attendanceData = await db.query(
      `SELECT e.id, e.first_name, e.last_name, e.employee_code, e.rate_per_day,
              SUM(CASE WHEN a.status = 'present' THEN a.hours_worked ELSE 0 END) as total_hours,
              COUNT(CASE WHEN a.status = 'present' THEN 1 END) as days_present
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id 
         AND a.attendance_date BETWEEN $1 AND $2
       WHERE e.status = 'active'
       GROUP BY e.id, e.first_name, e.last_name, e.employee_code, e.rate_per_day`,
      [period_start, period_end]
    );

    const payrollEntries = [];
    for (const emp of attendanceData.rows) {
      const total_days = emp.days_present || 0;
      const gross_amount = emp.rate_per_day * total_days;
      const net_amount = gross_amount; // Default no deductions
      
      // Insert payroll record
      const result = await db.query(
        `INSERT INTO payroll 
         (employee_id, period_start, period_end, total_days, total_hours, 
          rate_per_day, gross_amount, net_amount, processed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [emp.id, period_start, period_end, total_days, emp.total_hours || 0,
         emp.rate_per_day, gross_amount, net_amount, req.user.id]
      );
      
      payrollEntries.push(result.rows[0]);
    }

    res.json({
      success: true,
      data: payrollEntries,
      message: `Payroll generated for ${payrollEntries.length} employees`
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ error: 'Failed to generate payroll' });
  }
};

// Get all payrolls
exports.getPayrolls = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, e.first_name, e.last_name, e.employee_code,
             u.first_name as processed_by_name,
             COUNT(*) OVER() as total_count
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN users u ON p.processed_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY p.period_end DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};

// Export payroll to Excel
exports.exportPayrollExcel = async (req, res) => {
  try {
    const { period_start, period_end } = req.query;
    
    const payrollData = await db.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, e.position, e.phone
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.period_start = $1 AND p.period_end = $2
       ORDER BY e.first_name`,
      [period_start, period_end]
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    // Add headers
    worksheet.columns = [
      { header: 'Employee Code', key: 'employee_code', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Rate/Day', key: 'rate_per_day', width: 12 },
      { header: 'Days Worked', key: 'total_days', width: 12 },
      { header: 'Gross Amount', key: 'gross_amount', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 12 },
      { header: 'Net Amount', key: 'net_amount', width: 15 }
    ];

    // Add data
    payrollData.rows.forEach(row => {
      worksheet.addRow({
        employee_code: row.employee_code,
        name: `${row.first_name} ${row.last_name}`,
        position: row.position,
        rate_per_day: row.rate_per_day,
        total_days: row.total_days,
        gross_amount: row.gross_amount,
        deductions: row.deductions,
        net_amount: row.net_amount
      });
    });

    // Calculate totals
    const totalGross = payrollData.rows.reduce((sum, row) => sum + parseFloat(row.gross_amount), 0);
    const totalNet = payrollData.rows.reduce((sum, row) => sum + parseFloat(row.net_amount), 0);

    worksheet.addRow({});
    worksheet.addRow({
      employee_code: 'TOTAL',
      gross_amount: totalGross,
      net_amount: totalNet
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_${period_start}_${period_end}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting payroll:', error);
    res.status(500).json({ error: 'Failed to export payroll' });
  }
};

// Get payroll by period
exports.getPayrollByPeriod = async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.params;
    
    const result = await db.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, e.position, e.phone,
              u.first_name as processed_by_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN users u ON p.processed_by = u.id
       WHERE p.period_start = $1 AND p.period_end = $2
       ORDER BY e.first_name`,
      [periodStart, periodEnd]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll not found for this period' });
    }

    // Calculate summary
    const summary = {
      total_employees: result.rows.length,
      total_gross: result.rows.reduce((sum, row) => sum + parseFloat(row.gross_amount), 0),
      total_deductions: result.rows.reduce((sum, row) => sum + parseFloat(row.deductions), 0),
      total_net: result.rows.reduce((sum, row) => sum + parseFloat(row.net_amount), 0),
      paid_count: result.rows.filter(row => row.status === 'paid').length,
      pending_count: result.rows.filter(row => row.status === 'pending').length
    };

    res.json({
      success: true,
      data: result.rows,
      summary
    });
  } catch (error) {
    console.error('Error fetching payroll by period:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
};

// Mark as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_date } = req.body;

    const result = await db.query(
      `UPDATE payroll 
       SET status = 'paid', paid_date = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [paid_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Payroll marked as paid'
    });
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    res.status(500).json({ error: 'Failed to mark payroll as paid' });
  }
};

// Get employee payroll history
exports.getEmployeePayrollHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const result = await db.query(
      `SELECT p.*
       FROM payroll p
       WHERE p.employee_id = $1
       ORDER BY p.period_end DESC
       LIMIT 12`,
      [employeeId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching employee payroll history:', error);
    res.status(500).json({ error: 'Failed to fetch payroll history' });
  }
};