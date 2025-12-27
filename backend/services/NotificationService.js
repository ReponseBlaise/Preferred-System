const db = require('../config/database');
const emailService = require('./emailService');

class NotificationService {
  static async createNotification(userId, title, message, type = 'info') {
    try {
      const result = await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, title, message, type]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 20) {
    try {
      const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const result = await db.query(
        `UPDATE notifications 
         SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await db.query(
        `UPDATE notifications 
         SET is_read = true
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count FROM notifications 
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  static async createSystemNotification(title, message, type = 'system') {
    try {
      // Get all active users
      const usersResult = await db.query(
        'SELECT id FROM users WHERE is_active = true'
      );

      const notifications = [];
      for (const user of usersResult.rows) {
        const notification = await this.createNotification(user.id, title, message, type);
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  static async sendEmailNotification(userId, subject, htmlContent) {
    try {
      // Get user email
      const userResult = await db.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Send email
      await emailService.sendEmail(user.email, subject, htmlContent);

      // Create notification record
      await this.createNotification(
        userId,
        subject,
        'You have received an email notification',
        'email'
      );

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  static async notifyLowStock(material, currentQuantity) {
    try {
      const title = 'Low Stock Alert';
      const message = `${material.item_name} (${material.item_code}) is running low. Current: ${currentQuantity}, Reorder level: ${material.reorder_level}`;

      // Get store managers and managers
      const usersResult = await db.query(
        "SELECT id FROM users WHERE role IN ('store_manager', 'manager') AND is_active = true"
      );

      const notifications = [];
      for (const user of usersResult.rows) {
        const notification = await this.createNotification(user.id, title, message, 'warning');
        notifications.push(notification);
      }

      // Send email alert
      await emailService.sendLowStockAlert(material, currentQuantity);

      return notifications;
    } catch (error) {
      console.error('Error notifying low stock:', error);
      throw error;
    }
  }

  static async notifyPayrollGenerated(payrollPeriod, processedBy) {
    try {
      const title = 'Payroll Generated';
      const message = `Payroll for period ${payrollPeriod.start} to ${payrollPeriod.end} has been generated`;

      // Get all active employees
      const employeesResult = await db.query(
        'SELECT id FROM employees WHERE status = $1',
        ['active']
      );

      const notifications = [];
      for (const employee of employeesResult.rows) {
        // In a real system, we would get user ID for each employee
        // For now, we'll just log it
        console.log(`Payroll notification for employee ${employee.id}`);
      }

      // Create notification for manager
      await this.createNotification(processedBy, title, message, 'success');

      return true;
    } catch (error) {
      console.error('Error notifying payroll generation:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;