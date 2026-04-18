const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Cannot create an appointment in the past",
      },
    },
    status: {
      type: String,
      enum: ["available", "booked", "cancelled"],
      default: "available",
    },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctorId: 1, patientId: 1, date: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);

appointmentSchema.index(
  { patientId: 1, date: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
