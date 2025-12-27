

// ============================================
// middleware/auditLog.js - COMPLETE
// ============================================

const db = require('../config/database');

const auditLog = (action, tableName) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        
        res.json = function(data) {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                saveAuditLog({
                    userId: req.user.id,
                    action,
                    tableName,
                    recordId: data?.data?.id || req.params.id,
                    oldValues: req.body.oldValues || null,
                    newValues: req.body,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                }).catch(err => console.error('Audit log error:', err));
            }
            originalJson(data);
        };
        
        next();
    };
};

async function saveAuditLog(logData) {
    try {
        await db.query(
            `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                logData.userId,
                logData.action,
                logData.tableName,
                logData.recordId,
                logData.oldValues ? JSON.stringify(logData.oldValues) : null,
                logData.newValues ? JSON.stringify(logData.newValues) : null,
                logData.ipAddress,
                logData.userAgent
            ]
        );
    } catch (error) {
        console.error('Error saving audit log:', error.message);
    }
}

module.exports = auditLog;
