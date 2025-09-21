const mongoose = require("mongoose");
const { validate } = require("./User");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date(); // cannot be in the past
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

//ensure a patient cannot book more than one appointment with the same doctor on the same day
appointmentSchema.index(
  { doctorId: 1, patientId: 1, date: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);
//ensure a patient cannot book more than one appointment at the same time with different doctors
appointmentSchema.index(
  { patientId: 1, date: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);
module.exports = mongoose.model("Appointment", appointmentSchema);
