const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, role, first_name, last_name, phone, language_preference, is_active FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { username, email, password, role, first_name, last_name, phone } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users 
       (username, email, password_hash, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, role, first_name, last_name, phone`,
      [username, email, passwordHash, role, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'password') {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(value, salt);
        fields.push(`password_hash = $${paramCount}`);
        values.push(passwordHash);
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    }

    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING id, username, email, role, first_name, last_name, phone, language_preference, is_active
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async getAllUsers(role = null) {
    let query = 'SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async delete(id) {
    await db.query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );
  }

  static async getManagers() {
    const result = await db.query(
      "SELECT id, first_name, last_name, email FROM users WHERE role = 'manager' AND is_active = true"
    );
    return result.rows;
  }
}

module.exports = User;