const Doctor = require("../models/Doctor");

exports.createDoctorProfile = async (req, res) => {
    try {
        const doctorExists = await Doctor.findOne({ user: req.user._id });
        if (doctorExists) {
        return res.status(400).json({ message: "Doctor profile already exists" });
        }

        const doctor = await Doctor.create({
            user: req.user._id,
            specialization: req.body.specialization,
            experience: req.body.experience,
            clinicAddress: req.body.clinicAddress,
            phone: req.body.phone,
        });

        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Error creating doctor profile", error: error.message });
    }
};

exports.getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.params.id }).populate("user", "name email role");
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctor profile", error: error.message });
    }
};

exports.updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndUpdate(
        { user: req.params.id },
        req.body,
        { new: true }
        );
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Error updating doctor profile", error: error.message });
    }
};


exports.deleteDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndDelete({ user: req.params.id });
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json({ message: "Doctor profile deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting doctor profile", error: error.message });
    }
};
