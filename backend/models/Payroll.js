const db = require('../config/database');

class Payroll {
  static async generate(periodStart, periodEnd, processedBy) {
    // Calculate attendance for each employee
    const attendanceData = await db.query(
      `SELECT e.id as employee_id, e.rate_per_day,
              COUNT(a.id) as days_present,
              COALESCE(SUM(a.hours_worked), 0) as total_hours
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id 
         AND a.attendance_date BETWEEN $1 AND $2
         AND a.status = 'present'
       WHERE e.status = 'active'
       GROUP BY e.id, e.rate_per_day`,
      [periodStart, periodEnd]
    );

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const payrollEntries = [];
      for (const emp of attendanceData.rows) {
        const grossAmount = emp.rate_per_day * (emp.days_present || 0);
        const netAmount = grossAmount - 0; // Default no deductions
        
        const result = await client.query(
          `INSERT INTO payroll 
           (employee_id, period_start, period_end, total_days, total_hours, 
            rate_per_day, gross_amount, deductions, net_amount, processed_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [emp.employee_id, periodStart, periodEnd, emp.days_present || 0,
           emp.total_hours || 0, emp.rate_per_day, grossAmount, 0, netAmount, processedBy]
        );
        
        payrollEntries.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return payrollEntries;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByPeriod(periodStart, periodEnd) {
    const result = await db.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, e.position, e.phone
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.period_start = $1 AND p.period_end = $2
       ORDER BY e.first_name`,
      [periodStart, periodEnd]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, e.position, e.phone,
             u.first_name as processed_by_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN users u ON p.processed_by = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    updates.updated_at = new Date();
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    values.push(id);

    const query = `
      UPDATE payroll 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async markAsPaid(id, paidDate, updatedBy) {
    const result = await db.query(
      `UPDATE payroll 
       SET status = 'paid', paid_date = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [paidDate, id]
    );
    return result.rows[0];
  }

  static async getSummary(periodStart, periodEnd) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_employees,
        SUM(gross_amount) as total_gross,
        SUM(deductions) as total_deductions,
        SUM(net_amount) as total_net,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
       FROM payroll 
       WHERE period_start = $1 AND period_end = $2`,
      [periodStart, periodEnd]
    );
    return result.rows[0];
  }

  static async getEmployeeHistory(employeeId) {
    const result = await db.query(
      `SELECT p.*
       FROM payroll p
       WHERE p.employee_id = $1
       ORDER BY p.period_start DESC
       LIMIT 12`,
      [employeeId]
    );
    return result.rows;
  }
}

module.exports = Payroll;