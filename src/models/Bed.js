const mongoose = require("mongoose");
const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  status: { type: String, enum: ["available", "occupied", "maintenance"], default: "available" },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  admittedAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model("Bed", bedSchema);