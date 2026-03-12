const Bed = require("../models/Bed");
const Department = require("../models/Department");

exports.getBeds = async (req, res) => {
  try {
    const beds = await Bed.find().populate("department", "name").populate("patient", "name email");
    res.json(beds);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getBedsByDepartment = async (req, res) => {
  try {
    const beds = await Bed.find({ department: req.params.deptId }).populate("patient", "name email");
    res.json(beds);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createBed = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    res.status(201).json(bed);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignBed = async (req, res) => {
  try {
    const { patientId } = req.body;
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { status: "occupied", patient: patientId, admittedAt: new Date() },
      { new: true }
    ).populate("patient", "name email");
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    // Update department available beds
    await Department.findByIdAndUpdate(bed.department, { $inc: { availableBeds: -1 } });
    res.json(bed);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.releaseBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    await Department.findByIdAndUpdate(bed.department, { $inc: { availableBeds: 1 } });
    bed.status = "available";
    bed.patient = null;
    bed.admittedAt = null;
    await bed.save();
    res.json(bed);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBedStatus = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(bed);
  } catch (err) { res.status(500).json({ message: err.message }); }
};