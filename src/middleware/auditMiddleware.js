const AuditLog = require("../models/AuditLog");

const logAudit = async (req, action, resource, resourceId, details) => {
  try {
    await AuditLog.create({
      user: req.user?._id || null,
      action,
      resource,
      resourceId: resourceId || null,
      ipAddress: req.ip || req.connection?.remoteAddress,
      details,
    });
  } catch (err) {
    console.log("Audit log failed:", err.message);
  }
};

module.exports = logAudit;
