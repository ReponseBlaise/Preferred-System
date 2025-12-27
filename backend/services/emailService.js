const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email server connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user, password) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0056b3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #0056b3; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${process.env.APP_NAME}</h1>
        </div>
        <div class="content">
          <p>Hello ${user.first_name} ${user.last_name},</p>
          <p>Your account has been created successfully.</p>
          
          <div class="credentials">
            <p><strong>Login Details:</strong></p>
            <p>Email: ${user.email}</p>
            <p>Password: ${password}</p>
            <p>Role: ${user.role}</p>
          </div>
          
          <p>Please login and change your password immediately.</p>
          <p>Login URL: ${process.env.APP_URL}/login</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, `Welcome to ${process.env.APP_NAME}`, html);
};

const sendPayrollEmail = async (employee, payrollData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0056b3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .payroll-details { background-color: #fff; padding: 20px; border: 1px solid #ddd; margin: 15px 0; }
        .amount { font-size: 18px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payroll Notification</h1>
        </div>
        <div class="content">
          <p>Dear ${employee.first_name} ${employee.last_name},</p>
          <p>Your payroll for the period ${payrollData.period_start} to ${payrollData.period_end} has been processed.</p>
          
          <div class="payroll-details">
            <h3>Payroll Details:</h3>
            <p><strong>Employee Code:</strong> ${employee.employee_code}</p>
            <p><strong>Period:</strong> ${payrollData.period_start} to ${payrollData.period_end}</p>
            <p><strong>Days Worked:</strong> ${payrollData.total_days}</p>
            <p><strong>Rate per Day:</strong> RWF ${payrollData.rate_per_day.toLocaleString()}</p>
            <p><strong>Gross Amount:</strong> RWF ${payrollData.gross_amount.toLocaleString()}</p>
            <p><strong>Deductions:</strong> RWF ${payrollData.deductions.toLocaleString()}</p>
            <p class="amount"><strong>Net Amount:</strong> RWF ${payrollData.net_amount.toLocaleString()}</p>
            <p><strong>Status:</strong> ${payrollData.status}</p>
          </div>
          
          <p>If you have any questions, please contact the HR department.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(employee.email, 'Payroll Notification', html);
};

const sendLowStockAlert = async (material, currentQuantity) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert">
            <h3>⚠️ Attention Required</h3>
            <p>The following item is running low on stock:</p>
          </div>
          
          <p><strong>Item Code:</strong> ${material.item_code}</p>
          <p><strong>Item Name:</strong> ${material.item_name}</p>
          <p><strong>Current Quantity:</strong> ${currentQuantity} ${material.unit}</p>
          <p><strong>Reorder Level:</strong> ${material.reorder_level} ${material.unit}</p>
          <p><strong>Category:</strong> ${material.category || 'N/A'}</p>
          
          <p>Please reorder this item as soon as possible to avoid stockout.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to store manager and manager
  const managers = await getManagersEmails();
  return sendEmail(managers.join(','), 'Low Stock Alert', html);
};

const getManagersEmails = async () => {
  const db = require('../config/database');
  const result = await db.query(
    "SELECT email FROM users WHERE role IN ('manager', 'store_manager') AND is_active = true"
  );
  return result.rows.map(row => row.email);
};

const sendEnquiryResponse = async (enquiry, response) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0056b3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .enquiry { background-color: #fff; padding: 15px; border-left: 4px solid #0056b3; margin: 15px 0; }
        .response { background-color: #fff; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Enquiry Response</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your enquiry has received a response.</p>
          
          <div class="enquiry">
            <p><strong>Your Enquiry:</strong></p>
            <p><strong>Subject:</strong> ${enquiry.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${enquiry.message}</p>
          </div>
          
          <div class="response">
            <p><strong>Response:</strong></p>
            <p>${response}</p>
          </div>
          
          <p>Thank you for contacting us.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Get sender email
  const db = require('../config/database');
  const senderResult = await db.query(
    'SELECT email FROM users WHERE id = $1',
    [enquiry.from_user]
  );

  if (senderResult.rows.length > 0) {
    return sendEmail(senderResult.rows[0].email, `Response to: ${enquiry.subject}`, html);
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPayrollEmail,
  sendLowStockAlert,
  sendEnquiryResponse,
  getManagersEmails
};