const Appointment = require("../models/Appointment");
const billSchema = require("../models/Bill");
const Notification = require("../models/Notification");
const logAudit = require("../middleware/auditMiddleware");

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

    await logAudit(req, 'pay', 'bill', bill._id.toString(), `Bill paid: £${bill.amount}`);

    // Log payment on blockchain
    try {
      const { contract, deployerAccount } = require("../config/blockchain");
      const result = await contract.methods.logBilling(
        bill._id.toString(),
        req.user.id.toString(),
        Math.round(bill.amount),
        "paid"
      ).send({ from: deployerAccount, gas: 300000 });
      bill.blockchainTxHash = result.transactionHash;
      await bill.save();
    } catch (bcErr) {
      console.log("Blockchain billing update skipped:", bcErr.message);
    }

    // Notify patient about payment confirmation
    try {
      await Notification.create({
        user: req.user.id,
        title: "Payment Confirmed",
        message: `Your payment of £${bill.amount} has been processed successfully.`,
        type: "billing"
      });
    } catch (notifErr) {
      console.log("Notification skipped:", notifErr.message);
    }

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
