const Appointment = require("../models/Appointment");
const billSchema = require("../models/Bill");

//patient git all his Bills
exports.getMyBills = async (req, res) => {
  try {
    const patientId = req.user.id;
    const bills = await billSchema
      .find({ patientId })
      .populate("doctorId", "name")
      .populate("appointmentId", "date");
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//patient pay Bill
exports.payBill = async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billSchema.findOneAndUpdate(
      { _id: id, patientId: req.user.id, status: "pending" },
      { status: "paid" },
      { new: true }
    );
    if (!bill)
      return res.status(404).json({ error: "Bill not found or already paid" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//doctor get all his patients Bills
exports.getDoctorBills = async (req, res) => {
  try {
    const bill = await billSchema
      .find({ doctorId: req.user.id })
      .populate("patientId", "name")
      .populate("appointmentId", "date");
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//admin get all Bills
exports.getAdminAllBills = async (req, res) => {
  try {
    const bill = await billSchema
      .find()
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("appointmentId", "date");
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
