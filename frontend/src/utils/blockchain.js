import Web3 from "web3";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x3c183F3BCcD0de4Ea10f274B30448E12135105F6";
const GANACHE_URL = "http://127.0.0.1:7545";

// Minimal ABI — only the read functions we need
// NOTE: web3 1.10 strict parser requires `name` on every ABI parameter,
// including outputs. Use empty string for unnamed return values.
const ABI = [
  { inputs: [], name: "getTotalPatients", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalAppointments", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalBills", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalPrescriptions", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "_prescriptionId", type: "string" }],
    name: "getPrescription",
    outputs: [
      { name: "", type: "string" }, // prescriptionId
      { name: "", type: "string" }, // patientId
      { name: "", type: "string" }, // doctorId
      { name: "", type: "string" }, // medicineHash
      { name: "", type: "uint256" }, // timestamp
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_billId", type: "string" }],
    name: "getBilling",
    outputs: [
      { name: "", type: "string" }, // billId
      { name: "", type: "string" }, // patientId
      { name: "", type: "uint256" }, // amount
      { name: "", type: "string" }, // status
      { name: "", type: "uint256" }, // timestamp
      { name: "", type: "address" }, // paidBy
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_appointmentId", type: "string" }],
    name: "getAppointment",
    outputs: [
      { name: "", type: "string" }, // appointmentId
      { name: "", type: "string" }, // patientId
      { name: "", type: "string" }, // doctorId
      { name: "", type: "string" }, // status
      { name: "", type: "uint256" }, // timestamp
    ],
    stateMutability: "view",
    type: "function",
  },
];

let web3Instance = null;
let contractInstance = null;

const getWeb3 = () => {
  if (!web3Instance) {
    web3Instance = new Web3(GANACHE_URL);
  }
  return web3Instance;
};

export const getContract = () => {
  if (!contractInstance) {
    const web3 = getWeb3();
    contractInstance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  }
  return contractInstance;
};

export const getBlockchainStats = async () => {
  try {
    const contract = getContract();
    const [patients, appointments, bills, prescriptions] = await Promise.all([
      contract.methods.getTotalPatients().call(),
      contract.methods.getTotalAppointments().call(),
      contract.methods.getTotalBills().call(),
      contract.methods.getTotalPrescriptions().call(),
    ]);
    return {
      patients: parseInt(patients),
      appointments: parseInt(appointments),
      bills: parseInt(bills),
      prescriptions: parseInt(prescriptions),
    };
  } catch (err) {
    console.log("Blockchain stats fetch failed:", err.message);
    return { patients: 0, appointments: 0, bills: 0, prescriptions: 0 };
  }
};

export const verifyPrescription = async (prescriptionId) => {
  try {
    const contract = getContract();
    const result = await contract.methods.getPrescription(prescriptionId).call();
    return {
      exists: result[0] !== "",
      prescriptionId: result[0],
      patientId: result[1],
      doctorId: result[2],
      medicineHash: result[3],
      timestamp: parseInt(result[4]),
    };
  } catch {
    return { exists: false };
  }
};

export const verifyBilling = async (billId) => {
  try {
    const contract = getContract();
    const result = await contract.methods.getBilling(billId).call();
    return {
      exists: result[0] !== "",
      billId: result[0],
      patientId: result[1],
      amount: parseInt(result[2]),
      status: result[3],
      timestamp: parseInt(result[4]),
    };
  } catch {
    return { exists: false };
  }
};

export const verifyAppointment = async (appointmentId) => {
  try {
    const contract = getContract();
    const result = await contract.methods.getAppointment(appointmentId).call();
    return {
      exists: result[0] !== "",
      appointmentId: result[0],
      patientId: result[1],
      doctorId: result[2],
      status: result[3],
      timestamp: parseInt(result[4]),
    };
  } catch {
    return { exists: false };
  }
};
