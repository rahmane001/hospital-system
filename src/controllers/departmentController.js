// ============================================
// src/controllers/departmentController.js
// ============================================
const Department = require("../models/Department");

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("head", "name email");
    res.json(departments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};