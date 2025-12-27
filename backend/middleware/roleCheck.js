
// ============================================
// middleware/roleCheck.js - COMPLETE
// ============================================

const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: { message: 'Unauthorized - No user found' } 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: { 
                    message: 'Access denied. Insufficient permissions.',
                    required: allowedRoles,
                    current: req.user.role
                } 
            });
        }

        next();
    };
};

module.exports = roleCheck;