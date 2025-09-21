const Appointment = require("../models/Appointment");

// Doctor: Create new slot
exports.createAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date } = req.body;

    // Validate date
    if (new Date(date) < new Date()) {
      return res.status(400).json({ error: "Cannot add a slot in the past" });
    }

    // Check if doctor already has appointment at the same time
    const existing = await Appointment.findOne({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Doctor already has a slot at this time" });
    }

    //Create new appointment
    const appointment = new Appointment({ ...req.body, doctorId });
    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Doctor: Get all slots
exports.getAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor: Update slot
exports.updateAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId },
      req.body,
      { new: true }
    );
    if (!appointment)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Doctor: Delete slot
exports.deleteAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      doctorId,
    });
    if (!appointment)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Patient: Get available slots for a doctor
exports.getAvailableAppointments = async (req, res) => {
  try {
    const slots = await Appointment.find({
      doctorId: req.params.doctorId,
      status: "available",
    }).select("date status");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Patient: Book a slot
exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const slot = await Appointment.findOneAndUpdate(
      { _id: req.params.id, status: "available" },
      { status: "booked", patientId },
      { new: true }
    );
    if (!slot) return res.status(400).json({ error: "Slot not available" });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
