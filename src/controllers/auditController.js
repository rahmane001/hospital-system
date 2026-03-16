const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, resource, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;

    const logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
