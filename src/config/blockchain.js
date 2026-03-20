const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

const web3 = new Web3(process.env.GANACHE_URL || "http://127.0.0.1:7545");

const contractPath = path.join(
  __dirname,
  "../../blockchain/build/contracts/HospitalRecords.json"
);
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const abi = contractJSON.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new web3.eth.Contract(abi, contractAddress);
const deployerAccount = process.env.DEPLOYER_ACCOUNT;

module.exports = { web3, contract, deployerAccount };