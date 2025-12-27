const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));        // NEW
app.use('/api/employees', require('./routes/employees'));      // UPDATED
app.use('/api/attendance', require('./routes/attendance'));    // UPDATED
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Multi-Project System Running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: { message: err.message || 'Internal Server Error' } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Multi-Project API running on port ${PORT}`);
});