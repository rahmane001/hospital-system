/**
 * Demo Data Seeder — populates MongoDB with rich demo data for
 * screenshot / video capture.
 *
 * Idempotent: skips records that already exist (by unique keys).
 *
 * Usage: node scripts/demoData.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../src/models/User");
const Department = require("../src/models/Department");
const Bed = require("../src/models/Bed");
const Appointment = require("../src/models/Appointment");
const Bill = require("../src/models/Bill");
const Prescription = require("../src/models/Prescription");
const AuditLog = require("../src/models/AuditLog");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital_management";

// Deterministic fake tx hash
const fakeHash = (seed) =>
  "0x" +
  Array.from({ length: 64 })
    .map((_, i) => ((seed * 31 + i * 7) % 16).toString(16))
    .join("");

const DEPARTMENTS = [
  { name: "Cardiology", description: "Heart and vascular care.", totalBeds: 12 },
  { name: "Emergency", description: "24/7 emergency admissions.", totalBeds: 8 },
  { name: "Pediatrics", description: "Child and adolescent care.", totalBeds: 10 },
  { name: "Neurology", description: "Brain and nervous system.", totalBeds: 6 },
  { name: "Orthopedics", description: "Musculoskeletal care.", totalBeds: 10 },
  { name: "Oncology", description: "Cancer treatment and chemo.", totalBeds: 8 },
];

const RX_TEMPLATES = [
  {
    diagnosis: "Hypertension",
    notes: "Monitor BP daily. Low-sodium diet.",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
    ],
  },
  {
    diagnosis: "Type 2 Diabetes",
    notes: "Check blood sugar before meals. Follow diet plan.",
    medicines: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "60 days" },
    ],
  },
  {
    diagnosis: "Acute Bronchitis",
    notes: "Rest and hydration. Return if fever persists.",
    medicines: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "7 days" },
      { name: "Dextromethorphan", dosage: "10ml", frequency: "Every 6 hours", duration: "5 days" },
    ],
  },
  {
    diagnosis: "Migraine",
    notes: "Avoid triggers. Dark quiet room during episodes.",
    medicines: [
      { name: "Sumatriptan", dosage: "50mg", frequency: "As needed", duration: "PRN" },
    ],
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const admin = await User.findOne({ role: "admin" });
  const doctor = await User.findOne({ role: "doctor" });
  const patient = await User.findOne({ role: "patient" });
  if (!admin || !doctor || !patient) {
    throw new Error("Run scripts/seedAccounts.js first (admin/doctor/patient required).");
  }

  // Departments
  for (const d of DEPARTMENTS) {
    const exists = await Department.findOne({ name: d.name });
    if (exists) { console.log(`  [SKIP dept] ${d.name}`); continue; }
    await Department.create({ ...d, availableBeds: d.totalBeds });
    console.log(`  [CREATED dept] ${d.name}`);
  }
  const depts = await Department.find();

  // Beds — 3 per dept, mix statuses
  let bedCounter = 0;
  for (const dept of depts) {
    for (let i = 1; i <= 3; i++) {
      const num = `${dept.name.slice(0, 3).toUpperCase()}-${String(i).padStart(3, "0")}`;
      const exists = await Bed.findOne({ bedNumber: num });
      if (exists) { continue; }
      // Spread: 2 available, 1 occupied, rotating maintenance
      let status = "available";
      let patientRef = null;
      let admittedAt = null;
      if (i === 2) { status = "occupied"; patientRef = patient._id; admittedAt = new Date(); }
      if (i === 3 && bedCounter % 4 === 0) { status = "maintenance"; }
      await Bed.create({ bedNumber: num, department: dept._id, status, patient: patientRef, admittedAt });
      if (status !== "available") {
        await Department.updateOne({ _id: dept._id }, { $inc: { availableBeds: -1 } });
      }
      bedCounter++;
    }
  }
  console.log(`  [beds] ensured ~${depts.length * 3}`);

  // Appointments — mix of available / booked / cancelled, future dates
  const now = Date.now();
  const slots = [
    { offsetDays: 1, price: 80, status: "booked", hasPatient: true },
    { offsetDays: 2, price: 120, status: "booked", hasPatient: true },
    { offsetDays: 3, price: 90, status: "available", hasPatient: false },
    { offsetDays: 4, price: 150, status: "available", hasPatient: false },
    { offsetDays: 5, price: 100, status: "booked", hasPatient: true },
    { offsetDays: 6, price: 110, status: "cancelled", hasPatient: true },
    { offsetDays: 7, price: 75, status: "available", hasPatient: false },
    { offsetDays: 8, price: 200, status: "booked", hasPatient: true },
  ];
  const createdAppts = [];
  for (const [i, slot] of slots.entries()) {
    const date = new Date(now + slot.offsetDays * 86400000 + i * 3600000);
    const query = { doctorId: doctor._id, date };
    const existing = await Appointment.findOne(query);
    if (existing) { createdAppts.push(existing); continue; }
    const appt = await Appointment.create({
      doctorId: doctor._id,
      patientId: slot.hasPatient ? patient._id : null,
      date,
      status: slot.status,
      price: slot.price,
      blockchainTxHash: slot.status === "booked" ? fakeHash(i + 1) : null,
      blockchainStatus: slot.status === "booked" ? "logged" : "pending",
    });
    createdAppts.push(appt);
  }
  console.log(`  [appointments] ensured ${slots.length}`);

  // Bills — linked to booked appointments
  const bookedAppts = createdAppts.filter((a) => a.status === "booked");
  const billPlans = [
    { status: "paid", amount: 80 },
    { status: "paid", amount: 120 },
    { status: "pending", amount: 100 },
    { status: "pending", amount: 200 },
  ];
  for (const [i, plan] of billPlans.entries()) {
    const appt = bookedAppts[i % bookedAppts.length];
    if (!appt) break;
    const exists = await Bill.findOne({ appointmentId: appt._id });
    if (exists) { continue; }
    await Bill.create({
      appointmentId: appt._id,
      doctorId: doctor._id,
      patientId: patient._id,
      amount: plan.amount,
      status: plan.status,
      blockchainTxHash: fakeHash(100 + i),
      blockchainStatus: "logged",
    });
  }
  console.log(`  [bills] ensured up to ${billPlans.length}`);

  // Prescriptions
  for (const [i, tpl] of RX_TEMPLATES.entries()) {
    const appt = bookedAppts[i % bookedAppts.length];
    const exists = await Prescription.findOne({ diagnosis: tpl.diagnosis, doctor: doctor._id });
    if (exists) { continue; }
    await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appt ? appt._id : undefined,
      diagnosis: tpl.diagnosis,
      notes: tpl.notes,
      medicines: tpl.medicines,
      blockchainTxHash: fakeHash(200 + i),
      blockchainStatus: "logged",
    });
  }
  console.log(`  [prescriptions] ensured ${RX_TEMPLATES.length}`);

  // Audit log samples (schema: action enum, resource, user, details)
  const auditSamples = [
    { action: "login", resource: "user", user: admin._id, details: "Admin signed in" },
    { action: "create", resource: "appointment", user: doctor._id, details: "Created 3 new slots" },
    { action: "pay", resource: "bill", user: patient._id, details: "Paid £80 via MetaMask" },
    { action: "create", resource: "prescription", user: doctor._id, details: "Issued Rx for Hypertension" },
    { action: "update", resource: "bed", user: admin._id, details: "Bed CAR-002 assigned" },
    { action: "login", resource: "user", user: doctor._id, details: "Doctor signed in" },
    { action: "create", resource: "department", user: admin._id, details: "Added Oncology department" },
    { action: "wallet_login", resource: "user", user: patient._id, details: "MetaMask wallet login" },
  ];
  const existingAudits = await AuditLog.countDocuments();
  if (existingAudits < 5) {
    for (const a of auditSamples) {
      await AuditLog.create(a);
    }
    console.log(`  [audit] inserted ${auditSamples.length}`);
  } else {
    console.log(`  [audit] already ${existingAudits} entries, skipping`);
  }

  console.log("\nDemo data ready.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
