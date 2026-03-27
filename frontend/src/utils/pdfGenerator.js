import { jsPDF } from "jspdf";

const NHS_BLUE = [0, 94, 184];
const NHS_DARK = [0, 48, 135];

const addHeader = (doc, title) => {
  // NHS Blue header bar
  doc.setFillColor(...NHS_BLUE);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("HMS DApp", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Hospital Management System — Blockchain Powered", 15, 26);

  // Title
  doc.setTextColor(...NHS_DARK);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, 50);

  // Divider
  doc.setDrawColor(...NHS_BLUE);
  doc.setLineWidth(0.5);
  doc.line(15, 54, 195, 54);

  return 62; // y position after header
};

const addFooter = (doc, blockchainHash) => {
  const pageHeight = doc.internal.pageSize.height;

  if (blockchainHash) {
    doc.setFillColor(240, 247, 255);
    doc.rect(15, pageHeight - 35, 180, 20, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Blockchain Verified", 20, pageHeight - 27);
    doc.setFont("helvetica", "normal");
    doc.text(`Tx Hash: ${blockchainHash}`, 20, pageHeight - 21);
  }

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()} | HMS DApp — Hospital Management System`, 15, pageHeight - 8);
};

export const generatePrescriptionPDF = (prescription, doctorName) => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Medical Prescription");

  // Patient & Doctor info
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.text("Patient:", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(prescription.patient?.name || "N/A", 55, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Doctor:", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(`Dr. ${doctorName || prescription.doctor?.name || "N/A"}`, 55, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(prescription.createdAt).toLocaleDateString(), 55, y);

  if (prescription.diagnosis) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(prescription.diagnosis, 55, y);
  }

  // Medicines table
  y += 16;
  doc.setFillColor(...NHS_BLUE);
  doc.rect(15, y - 5, 180, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Medicine", 18, y);
  doc.text("Dosage", 80, y);
  doc.text("Frequency", 120, y);
  doc.text("Duration", 165, y);

  y += 8;
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  (prescription.medicines || []).forEach((med, i) => {
    const bgColor = i % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
    doc.setFillColor(...bgColor);
    doc.rect(15, y - 4, 180, 8, "F");
    doc.text(med.name || "", 18, y);
    doc.text(med.dosage || "", 80, y);
    doc.text(med.frequency || "", 120, y);
    doc.text(med.duration || "", 165, y);
    y += 8;
  });

  // Notes
  if (prescription.notes) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 15, y);
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(prescription.notes, 170);
    doc.text(lines, 15, y);
  }

  addFooter(doc, prescription.blockchainTxHash);
  doc.save(`prescription_${prescription._id?.slice(-8) || "doc"}.pdf`);
};

export const generateBillPDF = (bill, patientName) => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Payment Receipt");

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  const fields = [
    ["Bill ID:", bill._id || "N/A"],
    ["Patient:", patientName || bill.patientId?.name || "N/A"],
    ["Doctor:", bill.doctorId?.name || "N/A"],
    ["Date:", new Date(bill.createdAt).toLocaleDateString()],
    ["Appointment:", bill.appointmentId?.date ? new Date(bill.appointmentId.date).toLocaleString() : "N/A"],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 55, y);
    y += 8;
  });

  // Amount box
  y += 10;
  doc.setFillColor(240, 247, 255);
  doc.roundedRect(15, y - 5, 180, 30, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NHS_DARK);
  doc.text(`Amount: £${bill.amount}`, 25, y + 8);

  const statusColor = bill.status === "paid" ? [0, 150, 57] : [218, 41, 28];
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${bill.status?.toUpperCase()}`, 120, y + 8);

  addFooter(doc, bill.blockchainTxHash);
  doc.save(`bill_${bill._id?.slice(-8) || "receipt"}.pdf`);
};
