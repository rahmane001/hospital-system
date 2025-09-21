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
  },
  { timestamps: true }
);

appointmentSchema.index(
  { date: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "available" } }
);
module.exports = mongoose.model("Appointment", appointmentSchema);
