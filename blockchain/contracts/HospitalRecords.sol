// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HospitalRecords {
    address public owner;

    struct PatientRecord {
        string patientId;
        string dataHash;
        uint256 timestamp;
        bool exists;
    }

    struct AppointmentRecord {
        string appointmentId;
        string patientId;
        string doctorId;
        string status;
        uint256 timestamp;
    }

    struct BillingRecord {
        string billId;
        string patientId;
        uint256 amount;
        string status;
        uint256 timestamp;
        address paidBy;
    }

    struct PrescriptionRecord {
        string prescriptionId;
        string patientId;
        string doctorId;
        string medicineHash;
        uint256 timestamp;
    }

    mapping(string => PatientRecord) private patientRecords;
    mapping(string => AppointmentRecord) private appointmentRecords;
    mapping(string => BillingRecord) private billingRecords;
    mapping(string => PrescriptionRecord) private prescriptionRecords;

    string[] public patientIds;
    string[] public appointmentIds;
    string[] public billIds;
    string[] public prescriptionIds;

    event PatientRecordAdded(string patientId, string dataHash, uint256 timestamp);
    event AppointmentLogged(string appointmentId, string patientId, string doctorId, string status, uint256 timestamp);
    event BillingLogged(string billId, string patientId, uint256 amount, string status, uint256 timestamp, address paidBy);
    event PrescriptionLogged(string prescriptionId, string patientId, string doctorId, uint256 timestamp);
    event PaymentReceived(string billId, address payer, uint256 amount, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addPatientRecord(string memory _patientId, string memory _dataHash) public onlyOwner {
        patientRecords[_patientId] = PatientRecord(_patientId, _dataHash, block.timestamp, true);
        patientIds.push(_patientId);
        emit PatientRecordAdded(_patientId, _dataHash, block.timestamp);
    }

    function getPatientRecord(string memory _patientId) public view returns (string memory, string memory, uint256) {
        require(patientRecords[_patientId].exists, "Record not found");
        PatientRecord memory r = patientRecords[_patientId];
        return (r.patientId, r.dataHash, r.timestamp);
    }

    function logAppointment(string memory _appointmentId, string memory _patientId, string memory _doctorId, string memory _status) public onlyOwner {
        appointmentRecords[_appointmentId] = AppointmentRecord(_appointmentId, _patientId, _doctorId, _status, block.timestamp);
        appointmentIds.push(_appointmentId);
        emit AppointmentLogged(_appointmentId, _patientId, _doctorId, _status, block.timestamp);
    }

    function getAppointment(string memory _appointmentId) public view returns (string memory, string memory, string memory, string memory, uint256) {
        AppointmentRecord memory a = appointmentRecords[_appointmentId];
        return (a.appointmentId, a.patientId, a.doctorId, a.status, a.timestamp);
    }

    function logBilling(string memory _billId, string memory _patientId, uint256 _amount, string memory _status) public onlyOwner {
        billingRecords[_billId] = BillingRecord(_billId, _patientId, _amount, _status, block.timestamp, address(0));
        billIds.push(_billId);
        emit BillingLogged(_billId, _patientId, _amount, _status, block.timestamp, address(0));
    }

    function payBillOnChain(string memory _billId, string memory _patientId) public payable {
        require(msg.value > 0, "Must send ETH");
        billingRecords[_billId].status = "paid";
        billingRecords[_billId].paidBy = msg.sender;
        payable(owner).transfer(msg.value);
        emit PaymentReceived(_billId, msg.sender, msg.value, block.timestamp);
        emit BillingLogged(_billId, _patientId, msg.value, "paid", block.timestamp, msg.sender);
    }

    function getBilling(string memory _billId) public view returns (string memory, string memory, uint256, string memory, uint256, address) {
        BillingRecord memory b = billingRecords[_billId];
        return (b.billId, b.patientId, b.amount, b.status, b.timestamp, b.paidBy);
    }

    function logPrescription(string memory _prescriptionId, string memory _patientId, string memory _doctorId, string memory _medicineHash) public onlyOwner {
        prescriptionRecords[_prescriptionId] = PrescriptionRecord(_prescriptionId, _patientId, _doctorId, _medicineHash, block.timestamp);
        prescriptionIds.push(_prescriptionId);
        emit PrescriptionLogged(_prescriptionId, _patientId, _doctorId, block.timestamp);
    }

    function getPrescription(string memory _prescriptionId) public view returns (string memory, string memory, string memory, string memory, uint256) {
        PrescriptionRecord memory p = prescriptionRecords[_prescriptionId];
        return (p.prescriptionId, p.patientId, p.doctorId, p.medicineHash, p.timestamp);
    }

    function getTotalPatients() public view returns (uint256) { return patientIds.length; }
    function getTotalAppointments() public view returns (uint256) { return appointmentIds.length; }
    function getTotalBills() public view returns (uint256) { return billIds.length; }
    function getTotalPrescriptions() public view returns (uint256) { return prescriptionIds.length; }
}
