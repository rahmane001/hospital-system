const Prescription = require("../models/Prescription");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const logAudit = require("../middleware/auditMiddleware");

exports.createPrescription = async (req, res) => {
  try {
    const { patient, appointment, medicines, notes, diagnosis } = req.body;
    const doctor = req.user._id;

    const prescription = await Prescription.create({
      patient, doctor, appointment, medicines, notes, diagnosis
    });

    await logAudit(req, 'create', 'prescription', prescription._id.toString(), `Prescription for ${diagnosis} issued`);

    // Notify patient
    await Notification.create({
      user: patient,
      title: "New Prescription",
      message: `Dr. ${req.user.name} has issued you a new prescription for: ${diagnosis}`,
      type: "prescription"
    });

    // Try log on blockchain (state is surfaced — no silent swallow)
    try {
      const { contract, deployerAccount } = require("../config/blockchain");
      const medicineHash = crypto.createHash("sha256").update(JSON.stringify(medicines)).digest("hex");
      const result = await contract.methods.logPrescription(
        prescription._id.toString(),
        patient.toString(),
        doctor.toString(),
        medicineHash
      ).send({ from: deployerAccount, gas: 300000 });
      prescription.blockchainTxHash = result.transactionHash;
      prescription.blockchainStatus = "logged";
      await prescription.save();
    } catch (bcErr) {
      console.error("Blockchain prescription write failed:", bcErr.message);
      prescription.blockchainTxHash = null;
      prescription.blockchainStatus = "failed";
      await prescription.save();
    }

    res.status(201).json(prescription);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate("doctor", "name email")
      .populate("appointment", "date")
      .sort("-createdAt");
    res.json(prescriptions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate("patient", "name email")
      .populate("appointment", "date")
      .sort("-createdAt");
    res.json(prescriptions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort("-createdAt");
    res.json(prescriptions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};