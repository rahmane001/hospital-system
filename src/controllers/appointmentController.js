const Appointment = require("../models/Appointment");
const billSchema = require("../models/Bill");

// Doctor: Create new slot
exports.createAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date, price } = req.body;

    // Validate date
    if (new Date(date) < new Date()) {
      return res.status(400).json({ error: "Cannot add a slot in the past" });
    }
    // Validate price
    if (price <= 0) {
      return res.status(400).json({ error: "Price must be positive" });
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

/////////////////////////////////////////////////////////////////////////////////

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

// patient can view his booked appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({ patientId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Patient: Book a slot
exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const slot = await Appointment.findOne({
      _id: req.params.id,
      status: "available",
    });

    if (!slot) return res.status(400).json({ error: "Slot not available" });
    // Check if patient already has an appointment with the same doctor on the same day
    const sameDay = await Appointment.findOne({
      patientId,
      doctorId: slot.doctorId,
      status: "booked",
      date: {
        $gte: new Date(slot.date.setHours(0, 0, 0, 0)), // date start of the day
        $lte: new Date(slot.date.setHours(23, 59, 59, 999)), // date end of the day
      },
    });

    if (sameDay) {
      return res.status(400).json({
        error: "You already have an appointment with this doctor today",
      });
    }

    // Check if patient already has an appointment at the same time with different doctor
    const sameTime = await Appointment.findOne({
      patientId,
      date: slot.date,
      status: "booked",
    });

    if (sameTime) {
      return res
        .status(400)
        .json({ error: "You already have an appointment at this time" });
    }

    // Book the slot
    slot.status = "booked";
    slot.patientId = patientId;
    await slot.save();

    //generate bill for the appointment
    const bill = await billSchema.create({
      appointmentId: slot._id,
      doctorId: slot.doctorId,
      patientId,
      amount: slot.price,
    });
    //
    res.json({
      message: "Appointment booked successfully",
      appointment: slot,
      bill,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate Key Error
      if (err.message.includes("patientId_1_date_1")) {
        return res
          .status(400)
          .json({ error: "You already have an appointment at this time" });
      }
      if (err.message.includes("doctorId_1_patientId_1_date_1")) {
        return res.status(400).json({
          error: "You already have an appointment with this doctor today",
        });
      }
    }

    res.status(500).json({ error: err.message });
  }
};

/////////////////////////////////////////////////////////////////////////////////
// Admin: Get all appointments
exports.adminGetAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Delete any appointment
exports.adminDeleteAppointments = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
