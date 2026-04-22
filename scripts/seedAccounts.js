/**
 * Seed Script — Creates admin, doctor, and patient accounts
 * linked to the first 3 Ganache addresses.
 *
 * Usage: node scripts/seedAccounts.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital_management";

// First 3 Ganache addresses (from `truffle migrate` / Ganache GUI)
const ACCOUNTS = [
  {
    name: "Admin User",
    email: "admin@hms.com",
    password: "Password123!",
    role: "admin",
    isApproved: true,
    walletAddress: "0x813f1f522e201d5937666f331fc5096e6382c78a", // Ganache #1 (deployer)
  },
  {
    name: "Sarah Smith",
    email: "doctor@hms.com",
    password: "Password123!",
    role: "doctor",
    isApproved: true,
    doctorStatus: "approved",
    walletAddress: "0xf0711520842ba9816ca6a334a4dc121d8fecefa7", // Ganache #2
  },
  {
    name: "John Patient",
    email: "patient@hms.com",
    password: "Password123!",
    role: "patient",
    isApproved: true,
    walletAddress: "0x8395d939f25310690a391021f6d65554d7fce85e", // Ganache #3
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const account of ACCOUNTS) {
      // Check if user already exists
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        console.log(`  [SKIP] ${account.role} — ${account.email} already exists`);
        continue;
      }

      const user = await User.create(account);
      console.log(`  [CREATED] ${user.role} — ${user.email} (wallet: ${user.walletAddress})`);
    }

    console.log("\nDone! All accounts seeded.");
    console.log("\nLogin credentials:");
    console.log("  Admin:   admin@hms.com    / Password123!");
    console.log("  Doctor:  doctor@hms.com   / Password123!");
    console.log("  Patient: patient@hms.com  / Password123!");
    console.log("\nTo use MetaMask login, import the corresponding Ganache private keys into MetaMask.");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
