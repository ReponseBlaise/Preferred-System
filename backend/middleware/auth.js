
// ============================================
// middleware/auth.js - COMPLETE
// ============================================

const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided');
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const result = await db.query(
            'SELECT id, username, email, role, full_name FROM users WHERE id = $1 AND is_active = true',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        req.user = result.rows[0];
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ 
            error: { 
                message: 'Please authenticate',
                details: error.message 
            } 
        });
    }
};

module.exports = auth;
