const db = require('../config/database');

class Employee {
  static async create(employeeData) {
    const {
      employee_code,
      first_name,
      last_name,
      phone,
      position,
      rate_per_day,
      hire_date,
      created_by
    } = employeeData;

    const result = await db.query(
      `INSERT INTO employees 
       (employee_code, first_name, last_name, phone, position, rate_per_day, hire_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [employee_code, first_name, last_name, phone, position, rate_per_day, hire_date, created_by]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT e.*, u.first_name as created_by_name 
       FROM employees e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'active'
    } = filters;

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.*, 
             u.first_name as created_by_name,
             COUNT(*) OVER() as total_count
      FROM employees e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.status = $1
    `;
    
    let params = [status];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (e.first_name ILIKE $${paramCount} OR e.last_name ILIKE $${paramCount} OR e.employee_code ILIKE $${paramCount} OR e.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    
    return {
      data: result.rows,
      total: result.rows[0]?.total_count || 0
    };
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
      UPDATE employees 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'UPDATE employees SET status = $1 WHERE id = $2 RETURNING *',
      ['inactive', id]
    );
    return result.rows[0];
  }

  static async getAttendanceSummary(employeeId, startDate, endDate) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_days,
        COALESCE(SUM(hours_worked), 0) as total_hours
       FROM attendance 
       WHERE employee_id = $1 
         AND attendance_date BETWEEN $2 AND $3`,
      [employeeId, startDate, endDate]
    );

    return result.rows[0];
  }

  static async getActiveCount() {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM employees WHERE status = $1',
      ['active']
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Employee;