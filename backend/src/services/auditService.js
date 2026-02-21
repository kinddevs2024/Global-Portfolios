const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userId, action, targetType, targetId, metadata = {} }) => {
  if (!userId || !action || !targetType || !targetId) {
    return null;
  }

  return AuditLog.create({
    userId,
    action,
    targetType,
    targetId,
    metadata,
  });
};

module.exports = {
  logAudit,
};
