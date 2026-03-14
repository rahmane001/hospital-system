const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      enum: ["login", "wallet_login", "register", "create", "update", "delete", "view", "pay", "link_wallet", "approve"],
      required: true,
    },
    resource: { type: String, required: true }, // e.g. "appointment", "bill", "prescription", "user"
    resourceId: { type: String },
    ipAddress: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

// Index for fast queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
