
// ============================================
// routes/requests.js
// ============================================

const express4 = require('express');
const router4 = express4.Router();
const requestController = require('../controllers/requestController');
const auth4 = require('../middleware/auth');
const roleCheck4 = require('../middleware/roleCheck');
const auditLog4 = require('../middleware/auditLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if not exists
const uploadDir = 'uploads/requests';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'request-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5242880 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Word documents are allowed'));
        }
    }
});

router4.use(auth4);

router4.get('/', requestController.getAllRequests);
router4.post('/', upload.single('attachment'), auditLog4('CREATE', 'requests'), (req, res, next) => {
    if (req.file) {
        req.body.attachment_url = '/uploads/requests/' + req.file.filename;
    }
    next();
}, requestController.createRequest);
router4.put('/:id', roleCheck4('manager'), auditLog4('UPDATE', 'requests'), requestController.updateRequest);

module.exports = router4;
