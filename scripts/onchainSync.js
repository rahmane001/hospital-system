/**
 * On-Chain Sync — writes existing DB records to the HospitalRecords
 * smart contract so the "On-Chain Record Counts" panel is populated
 * and verification rows actually resolve to the real chain state.
 *
 * Skips records that already have blockchainStatus === "logged".
 *
 * Usage: node scripts/onchainSync.js
 */

require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");

const { contract, deployerAccount } = require("../src/config/blockchain");
const Appointment = require("../src/models/Appointment");
const Bill = require("../src/models/Bill");
const Prescription = require("../src/models/Prescription");
const User = require("../src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital_management";

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

async function writeAppointment(appt) {
  const tx = await contract.methods
    .logAppointment(
      appt._id.toString(),
      (appt.patientId || "unassigned").toString(),
      appt.doctorId.toString(),
      appt.status
    )
    .send({ from: deployerAccount, gas: 500000 });
  // updateOne bypasses the "date in future" validator so we can stamp
  // historical fixture rows without rejecting the save.
  await Appointment.updateOne(
    { _id: appt._id },
    { $set: { blockchainTxHash: tx.transactionHash, blockchainStatus: "logged" } }
  );
}

async function writeBill(bill) {
  const tx = await contract.methods
    .logBilling(
      bill._id.toString(),
      bill.patientId.toString(),
      Math.round(bill.amount),
      bill.status
    )
    .send({ from: deployerAccount, gas: 500000 });
  bill.blockchainTxHash = tx.transactionHash;
  bill.blockchainStatus = "logged";
  await bill.save();
}

async function writePrescription(rx) {
  const medicineHash = sha(JSON.stringify(rx.medicines || []));
  const tx = await contract.methods
    .logPrescription(
      rx._id.toString(),
      rx.patient.toString(),
      rx.doctor.toString(),
      medicineHash
    )
    .send({ from: deployerAccount, gas: 500000 });
  rx.blockchainTxHash = tx.transactionHash;
  rx.blockchainStatus = "logged";
  await rx.save();
}

async function writePatientRecord(user) {
  const dataHash = sha(`${user.name}|${user.email}|${user.walletAddress}`);
  await contract.methods
    .addPatientRecord(user._id.toString(), dataHash)
    .send({ from: deployerAccount, gas: 500000 });
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Resolve deployer from chain (case-insensitive) to avoid mismatch
  const accounts = await (await require("../src/config/blockchain")).web3.eth.getAccounts();
  console.log(`Ganache deployer: ${accounts[0]}`);

  // Patient records — add for each patient user
  const patients = await User.find({ role: "patient" });
  for (const p of patients) {
    try {
      await writePatientRecord(p);
      console.log(`  [patient] logged ${p.email}`);
    } catch (err) {
      // Likely already exists on-chain; mapping overwrites are safe
      console.log(`  [patient] ${p.email} — ${err.message.split("\n")[0]}`);
    }
  }

  // Appointments
  const appts = await Appointment.find();
  let apptOk = 0;
  for (const a of appts) {
    if (a.blockchainStatus === "logged" && a.blockchainTxHash?.length === 66) {
      // Already real hash? Skip if verifiable. Otherwise re-log.
      const isRealHash = /^0x[0-9a-f]{64}$/i.test(a.blockchainTxHash);
      if (isRealHash) {
        try {
          const receipt = await require("../src/config/blockchain").web3.eth.getTransactionReceipt(a.blockchainTxHash);
          if (receipt) { apptOk++; continue; }
        } catch {}
      }
    }
    try {
      await writeAppointment(a);
      apptOk++;
    } catch (err) {
      console.log(`  [appt ${a._id}] ${err.message.split("\n")[0]}`);
    }
  }
  console.log(`  [appointments] on-chain: ${apptOk}/${appts.length}`);

  // Bills
  const bills = await Bill.find();
  let billOk = 0;
  for (const b of bills) {
    try {
      const receipt = b.blockchainTxHash && await require("../src/config/blockchain").web3.eth.getTransactionReceipt(b.blockchainTxHash).catch(() => null);
      if (receipt) { billOk++; continue; }
    } catch {}
    try {
      await writeBill(b);
      billOk++;
    } catch (err) {
      console.log(`  [bill ${b._id}] ${err.message.split("\n")[0]}`);
    }
  }
  console.log(`  [bills] on-chain: ${billOk}/${bills.length}`);

  // Prescriptions
  const rxs = await Prescription.find();
  let rxOk = 0;
  for (const r of rxs) {
    try {
      const receipt = r.blockchainTxHash && await require("../src/config/blockchain").web3.eth.getTransactionReceipt(r.blockchainTxHash).catch(() => null);
      if (receipt) { rxOk++; continue; }
    } catch {}
    try {
      await writePrescription(r);
      rxOk++;
    } catch (err) {
      console.log(`  [rx ${r._id}] ${err.message.split("\n")[0]}`);
    }
  }
  console.log(`  [prescriptions] on-chain: ${rxOk}/${rxs.length}`);

  // Final counters
  const totals = await Promise.all([
    contract.methods.getTotalPatients().call(),
    contract.methods.getTotalAppointments().call(),
    contract.methods.getTotalBills().call(),
    contract.methods.getTotalPrescriptions().call(),
  ]);
  console.log(`\nOn-chain totals — patients: ${totals[0]}, appts: ${totals[1]}, bills: ${totals[2]}, rx: ${totals[3]}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
