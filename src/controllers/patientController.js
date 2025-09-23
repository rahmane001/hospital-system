const Patient = require("../models/Patient");

exports.createPatientProfile = async (req, res) => {
    try {
        const patientExists = await Patient.findOne({ user: req.user._id });
        if (patientExists) {
        return res.status(400).json({ message: "Patient profile already exists" });
        }

        const patient = await Patient.create({
            user: req.user._id,
            age: req.body.age,
            gender: req.body.gender,
            medicalHistory: req.body.medicalHistory || [],
            allergies: req.body.allergies || [],
        });

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error creating patient profile", error: error.message });
    }
};


exports.getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.params.id }).populate("user", "name email role");
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patient profile", error: error.message });
    }
};


exports.updatePatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOneAndUpdate(
        { user: req.params.id },
        req.body,
        { new: true }
        );
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error updating patient profile", error: error.message });
    }
};


exports.deletePatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ user: req.params.id });
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json({ message: "Patient profile deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting patient profile", error: error.message });
    }
};
