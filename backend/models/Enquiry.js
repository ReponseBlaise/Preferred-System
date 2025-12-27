const db = require('../config/database');

class Enquiry {
  static async create(enquiryData) {
    const {
      from_user,
      to_user,
      subject,
      message,
      attachment_url
    } = enquiryData;

    const result = await db.query(
      `INSERT INTO enquiries 
       (from_user, to_user, subject, message, attachment_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [from_user, to_user, subject, message, attachment_url]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT e.*, 
             fu.first_name as from_first_name, fu.last_name as from_last_name,
             tu.first_name as to_first_name, tu.last_name as to_last_name
       FROM enquiries e
       JOIN users fu ON e.from_user = fu.id
       JOIN users tu ON e.to_user = tu.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByUser(userId, role) {
    let query = '';
    const params = [userId];

    if (role === 'manager') {
      query = `
        SELECT e.*, 
               fu.first_name as from_first_name, fu.last_name as from_last_name,
               fu.role as from_role
        FROM enquiries e
        JOIN users fu ON e.from_user = fu.id
        WHERE e.to_user = $1
        ORDER BY e.created_at DESC
      `;
    } else {
      query = `
        SELECT e.*, 
               tu.first_name as to_first_name, tu.last_name as to_last_name
        FROM enquiries e
        JOIN users tu ON e.to_user = tu.id
        WHERE e.from_user = $1
        ORDER BY e.created_at DESC
      `;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async respond(id, response, userId) {
    const result = await db.query(
      `UPDATE enquiries 
       SET response = $1, responded_at = CURRENT_TIMESTAMP, status = 'responded'
       WHERE id = $2 AND to_user = $3
       RETURNING *`,
      [response, id, userId]
    );

    if (result.rows.length > 0) {
      // Create notification for the sender
      const enquiry = result.rows[0];
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Response Received', 
                CONCAT('Your enquiry "', $2, '" has been responded to'), 'enquiry')`,
        [enquiry.from_user, enquiry.subject]
      );
    }

    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async getPendingCount(userId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM enquiries WHERE to_user = $1 AND status = $2',
      [userId, 'pending']
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Enquiry;