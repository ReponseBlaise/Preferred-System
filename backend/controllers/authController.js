
// ============================================
// controllers/authController.js - COMPLETE
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('../config/database');

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, role, full_name } = req.body;

        // Validate input
        if (!username || !email || !password || !role || !full_name) {
            return res.status(400).json({ 
                error: { message: 'All fields are required' } 
            });
        }

        // Check if user exists
        const existingUser = await sql`
            SELECT * FROM users WHERE email = ${email} OR username = ${username}
        `;

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                error: { message: 'User already exists with this email or username' } 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await sql`
            INSERT INTO users (username, email, password, role, full_name)
            VALUES (${username}, ${email}, ${hashedPassword}, ${role}, ${full_name})
            RETURNING id, username, email, role, full_name, created_at
        `;

        const user = result[0];

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            data: { user, token }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                error: { message: 'Email and password are required' } 
            });
        }

        // Find user
        const result = await sql`
            SELECT * FROM users WHERE email = ${email} AND is_active = true
        `;

        if (result.length === 0) {
            return res.status(401).json({ 
                error: { message: 'Invalid email or password' } 
            });
        }

        const user = result[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ 
                error: { message: 'Invalid email or password' } 
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Remove password from response
        delete user.password;

        console.log('User logged in:', user.email);

        res.json({
            success: true,
            data: { user, token }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
};