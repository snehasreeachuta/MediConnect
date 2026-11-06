const db = require('../config/db');

class AuditLog {
  static async log({ actorUserId = null, action, resourceType, resourceId = null, details = null, ipAddress = null }) {
    try {
      const detailsStr = details ? JSON.stringify(details) : null;
      await db.query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [actorUserId, action, resourceType, resourceId ? String(resourceId) : null, detailsStr, ipAddress]
      );
    } catch (err) {
      console.error('[AuditLog Error]', err.message);
    }
  }
}

module.exports = AuditLog;
