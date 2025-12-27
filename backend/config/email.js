
// ============================================
// config/email.js
// ============================================

require('dotenv').config();

module.exports = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM
};
