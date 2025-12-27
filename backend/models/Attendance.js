const db = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const {
      employee_id,
      attendance_date,
      hours_worked,
      comment,
      status,
      recorded_by
    } = attendanceData;

    const result = await db.query(
      `INSERT INTO attendance 
       (employee_id, attendance_date, hours_worked, comment, status, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [employee_id, attendance_date, hours_worked, comment, status, recorded_by]
    );

    return result.rows[0];
  }

  static async findByEmployeeAndDate(employeeId, date) {
    const result = await db.query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.employee_id = $1 AND a.attendance_date = $2`,
      [employeeId, date]
    );
    return result.rows[0];
  }

  static async getByDate(date) {
    const result = await db.query(
      `SELECT a.*, e.first_name, e.last_name, e.employee_code, e.position
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.attendance_date = $1
       ORDER BY e.first_name`,
      [date]
    );
    return result.rows;
  }

  static async getReport(startDate, endDate, employeeId = null) {
    let query = `
      SELECT a.*, e.first_name, e.last_name, e.employee_code, e.position,
             u.first_name as recorded_by_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON a.recorded_by = u.id
      WHERE a.attendance_date BETWEEN $1 AND $2
    `;
    
    const params = [startDate, endDate];
    
    if (employeeId) {
      query += ' AND a.employee_id = $3';
      params.push(employeeId);
    }
    
    query += ' ORDER BY a.attendance_date DESC, e.first_name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async bulkCreate(records, recordedBy) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const record of records) {
        const { employee_id, attendance_date, hours_worked, comment, status } = record;
        
        const query = `
          INSERT INTO attendance 
          (employee_id, attendance_date, hours_worked, comment, status, recorded_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (employee_id, attendance_date) 
          DO UPDATE SET hours_worked = EXCLUDED.hours_worked,
                        comment = EXCLUDED.comment,
                        status = EXCLUDED.status,
                        updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        
        const result = await client.query(query, [
          employee_id, attendance_date, hours_worked || 8, comment, status || 'present', recordedBy
        ]);
        
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMonthlySummary(year, month) {
    const result = await db.query(
      `SELECT 
        DATE(attendance_date) as date,
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_count
       FROM attendance 
       WHERE EXTRACT(YEAR FROM attendance_date) = $1 
         AND EXTRACT(MONTH FROM attendance_date) = $2
       GROUP BY DATE(attendance_date)
       ORDER BY date`,
      [year, month]
    );
    return result.rows;
  }
}

module.exports = Attendance;