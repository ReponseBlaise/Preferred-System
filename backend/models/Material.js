const db = require('../config/database');

class Material {
  static async create(materialData) {
    const {
      item_code,
      item_name,
      category,
      unit,
      quantity,
      reorder_level,
      unit_price,
      supplier,
      location,
      description,
      created_by
    } = materialData;

    const result = await db.query(
      `INSERT INTO materials 
       (item_code, item_name, category, unit, quantity, reorder_level, 
        unit_price, supplier, location, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [item_code, item_name, category, unit, quantity, reorder_level, 
       unit_price, supplier, location, description, created_by]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT m.*, u.first_name as created_by_name 
       FROM materials m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = ''
    } = filters;

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, 
             u.first_name as created_by_name,
             COUNT(*) OVER() as total_count
      FROM materials m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (m.item_name ILIKE $${paramCount} OR m.item_code ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND m.category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY m.item_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
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
      UPDATE materials 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM materials WHERE id = $1', [id]);
  }

  static async getLowStock() {
    const result = await db.query(
      'SELECT * FROM materials WHERE quantity <= reorder_level ORDER BY quantity ASC',
      []
    );
    return result.rows;
  }

  static async getTotalValue() {
    const result = await db.query(
      'SELECT SUM(quantity * unit_price) as total_value FROM materials',
      []
    );
    return parseFloat(result.rows[0].total_value || 0);
  }

  static async getCategories() {
    const result = await db.query(
      'SELECT DISTINCT category FROM materials WHERE category IS NOT NULL ORDER BY category',
      []
    );
    return result.rows.map(row => row.category);
  }

  static async recordTransaction(transactionData) {
    const {
      material_id,
      transaction_type,
      quantity,
      unit_price,
      reference_no,
      transaction_date,
      performed_by,
      notes
    } = transactionData;

    // Update material quantity
    let updateQuery = '';
    if (transaction_type === 'purchase' || transaction_type === 'return') {
      updateQuery = 'UPDATE materials SET quantity = quantity + $1 WHERE id = $2';
    } else if (transaction_type === 'issue') {
      updateQuery = 'UPDATE materials SET quantity = quantity - $1 WHERE id = $2';
    }

    await db.query(updateQuery, [quantity, material_id]);

    // Record transaction
    const total_amount = quantity * unit_price;
    
    const result = await db.query(
      `INSERT INTO inventory_transactions 
       (material_id, transaction_type, quantity, unit_price, total_amount, 
        reference_no, transaction_date, performed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [material_id, transaction_type, quantity, unit_price, total_amount,
       reference_no, transaction_date, performed_by, notes]
    );

    return result.rows[0];
  }

  static async getTransactions(materialId = null) {
    let query = `
      SELECT t.*, m.item_name, m.item_code,
             u.first_name as performed_by_name
      FROM inventory_transactions t
      JOIN materials m ON t.material_id = m.id
      LEFT JOIN users u ON t.performed_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (materialId) {
      query += ' AND t.material_id = $1';
      params.push(materialId);
    }
    
    query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Material;