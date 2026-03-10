// ============================================
// src/models/Department.js
// ============================================
const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalBeds: { type: Number, default: 10 },
  availableBeds: { type: Number, default: 10 },
}, { timestamps: true });
module.exports = mongoose.model("Department", departmentSchema);