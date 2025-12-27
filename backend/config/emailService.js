// ============================================
// utils/emailService.js
// ============================================

const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

// Create transporter
const transporter = nodemailer.createTransporter({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// Send Welcome Email
exports.sendWelcomeEmail = async (user) => {
    try {
        const mailOptions = {
            from: emailConfig.from,
            to: user.email,
            subject: 'Welcome to Preferred Contractors Management System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1e40af; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">PREFERRED CONTRACTORS LTD</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f5f5f5;">
                        <h2 style="color: #333;">Welcome, ${user.full_name}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Your account has been successfully created in the Preferred Contractors Management System.
                        </p>
                        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>Username:</strong> ${user.username}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
                            <p style="margin: 10px 0;"><strong>Role:</strong> ${user.role}</p>
                        </div>
                        <p style="color: #666;">
                            Please keep your login credentials secure. If you have any questions, 
                            feel free to contact our support team.
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/login" 
                               style="background-color: #1e40af; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Login to Your Account
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #333; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 5px 0;">Contact: +250 788 217 389</p>
                        <p style="margin: 5px 0;">Email: info@preferred.rw</p>
                        <p style="margin: 5px 0;">Website: www.preferred.rw</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', user.email);
    } catch (error) {
        console.error('Send welcome email error:', error);
    }
};

// Send Request Notification
exports.sendRequestNotification = async (request, requester) => {
    try {
        // Get manager emails
        const db = require('../config/database');
        const result = await db.query(
            "SELECT email FROM users WHERE role = 'manager' AND is_active = true"
        );

        const managerEmails = result.rows.map(row => row.email);

        if (managerEmails.length === 0) return;

        const mailOptions = {
            from: emailConfig.from,
            to: managerEmails,
            subject: `New Request: ${request.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1e40af; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">PREFERRED CONTRACTORS LTD</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f5f5f5;">
                        <h2 style="color: #333;">New Request Received</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>From:</strong> ${requester.full_name}</p>
                            <p style="margin: 10px 0;"><strong>Type:</strong> ${request.request_type}</p>
                            <p style="margin: 10px 0;"><strong>Subject:</strong> ${request.subject}</p>
                            <p style="margin: 10px 0;"><strong>Message:</strong></p>
                            <p style="color: #666; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #1e40af;">
                                ${request.message}
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/requests" 
                               style="background-color: #1e40af; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Request
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #333; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 5px 0;">This is an automated notification</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Request notification sent to managers');
    } catch (error) {
        console.error('Send request notification error:', error);
    }
};

// Send Request Response Notification
exports.sendRequestResponseNotification = async (request, requester) => {
    try {
        const mailOptions = {
            from: emailConfig.from,
            to: requester.email,
            subject: `Your Request has been ${request.status}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1e40af; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">PREFERRED CONTRACTORS LTD</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f5f5f5;">
                        <h2 style="color: #333;">Request Update</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>Subject:</strong> ${request.subject}</p>
                            <p style="margin: 10px 0;"><strong>Status:</strong> 
                                <span style="color: ${request.status === 'approved' ? 'green' : 'red'}; font-weight: bold;">
                                    ${request.status.toUpperCase()}
                                </span>
                            </p>
                            ${request.response ? `
                                <p style="margin: 10px 0;"><strong>Response:</strong></p>
                                <p style="color: #666; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #1e40af;">
                                    ${request.response}
                                </p>
                            ` : ''}
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/requests" 
                               style="background-color: #1e40af; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Details
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #333; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 5px 0;">Contact: +250 788 217 389</p>
                        <p style="margin: 5px 0;">Email: info@preferred.rw</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Request response sent to:', requester.email);
    } catch (error) {
        console.error('Send request response error:', error);
    }
};

// Send Payroll Report
exports.sendPayrollReport = async (recipients, pdfBuffer, period) => {
    try {
        const mailOptions = {
            from: emailConfig.from,
            to: recipients,
            subject: `Payroll Report - ${period.start_date} to ${period.end_date}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1e40af; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">PREFERRED CONTRACTORS LTD</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f5f5f5;">
                        <h2 style="color: #333;">Payroll Report</h2>
                        <p style="color: #666;">
                            Please find attached the payroll report for the period 
                            ${period.start_date} to ${period.end_date}.
                        </p>
                    </div>
                    <div style="background-color: #333; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 5px 0;">Contact: +250 788 217 389 | Email: info@preferred.rw</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `payroll-${period.start_date}-to-${period.end_date}.pdf`,
                    content: pdfBuffer
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log('Payroll report sent to:', recipients);
    } catch (error) {
        console.error('Send payroll report error:', error);
    }
};

module.exports = exports;