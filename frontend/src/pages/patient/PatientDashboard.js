import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import MetaMaskBar from "../../components/MetaMaskBar";
import { getUsers, getAvailableAppointments, bookAppointment, getPatientAppointments, getMyBills, payBill, getMyPrescriptions } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { payWithMetaMask, getMetaMaskAccount, isMetaMaskInstalled } from "../../utils/metamask";
import { toast } from "react-toastify";
import { generatePrescriptionPDF, generateBillPDF } from "../../utils/pdfGenerator";

const DEPLOYER = "0x813F1f522E201d5937666f331FC5096e6382c78a";

const PatientDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, a, b, p] = await Promise.all([getUsers(), getPatientAppointments(), getMyBills(), getMyPrescriptions()]);
      setDoctors(u.data.filter(u => u.role === "doctor" && u.doctorStatus === "approved"));
      setAppointments(a.data);
      setBills(b.data);
      setPrescriptions(p.data);
    } catch (err) { toast.error("Failed to load data"); }
    setLoading(false);
  };

  const handleViewSlots = async (doctorId, doctorName) => {
    try {
      const { data } = await getAvailableAppointments(doctorId);
      setSlots(data);
      setSelectedDoctor({ id: doctorId, name: doctorName });
    } catch (err) { toast.error("Failed to load slots"); }
  };

  const handleBook = async (id) => {
    try {
      await bookAppointment(id);
      toast.success("Appointment booked! A bill has been generated.");
      loadAll();
      setSelectedDoctor(null);
    } catch (err) { toast.error(err.response?.data?.error || "Booking failed"); }
  };

  const handlePayNormal = async (id) => {
    try {
      await payBill(id);
      toast.success("Bill paid successfully!");
      loadAll();
    } catch (err) { toast.error("Payment failed"); }
  };

  const handlePayMetaMask = async (bill) => {
    if (!isMetaMaskInstalled()) { toast.error("MetaMask not installed!"); return; }
    setPayingBill(bill._id);
    try {
      const account = await getMetaMaskAccount();
      if (!account) { toast.error("Please connect MetaMask first"); setPayingBill(null); return; }
      const amountEth = bill.amount / 1000; // Convert £ to ETH (symbolic for demo)
      const txHash = await payWithMetaMask(DEPLOYER, amountEth, bill._id);
      await payBill(bill._id);
      toast.success(`Payment sent! TX: ${txHash.slice(0, 16)}...`);
      loadAll();
    } catch (err) {
      if (err.code === 4001) toast.error("Transaction rejected by user");
      else toast.error(err.message || "MetaMask payment failed");
    }
    setPayingBill(null);
  };

  if (loading) return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content"><div className="loading-container"><div className="spinner" /></div></div>
    </div>
  );

  const renderPage = () => {
    if (path === "/patient") return (
      <div>
        <div className="page-header"><h1>Welcome, {user?.name}</h1><p>Your healthcare dashboard</p></div>
        <div style={{ padding: "0 32px" }}>
          <MetaMaskBar />
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon">👨‍⚕️</span><div className="stat-info"><h3>{doctors.length}</h3><p>Available Doctors</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">📅</span><div className="stat-info"><h3>{appointments.length}</h3><p>My Appointments</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">💳</span><div className="stat-info"><h3>{bills.filter(b => b.status === "pending").length}</h3><p>Pending Bills</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-red)" }}><span className="stat-icon">💊</span><div className="stat-info"><h3>{prescriptions.length}</h3><p>Prescriptions</p></div></div>
          </div>

          {bills.filter(b => b.status === "pending").length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 24 }}>
              ⚠️ You have {bills.filter(b => b.status === "pending").length} pending bill(s). <a href="/patient/billing" style={{ color: "inherit", fontWeight: 600 }}>Pay now →</a>
            </div>
          )}

          {prescriptions.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header"><h3>Latest Prescription</h3></div>
              <div className="card-body">
                <div style={{ fontWeight: 600 }}>Dr. {prescriptions[0]?.doctor?.name}</div>
                <div style={{ color: "var(--nhs-dark-grey)", fontSize: 13, marginBottom: 8 }}>{new Date(prescriptions[0]?.createdAt).toLocaleDateString()}</div>
                {prescriptions[0]?.diagnosis && <div className="badge badge-blue" style={{ marginBottom: 8 }}>Diagnosis: {prescriptions[0].diagnosis}</div>}
                <div className="medicine-list">
                  {prescriptions[0]?.medicines?.slice(0, 3).map((m, i) => (
                    <div key={i} className="medicine-item">
                      <span>💊 {m.name}</span>
                      <span style={{ color: "var(--nhs-dark-grey)" }}>{m.dosage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    if (path === "/patient/doctors") return (
      <div>
        <div className="page-header"><h1>Find a Doctor</h1><p>Book an appointment with our specialists</p></div>
        <div style={{ padding: "0 32px" }}>
          {selectedDoctor ? (
            <div>
              <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setSelectedDoctor(null)}>← Back to Doctors</button>
              <h3 style={{ marginBottom: 16, color: "var(--nhs-dark-blue)" }}>Available slots with Dr. {selectedDoctor.name}</h3>
              {slots.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📅</div><h3>No available slots</h3><p>This doctor hasn't added any slots yet</p></div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {slots.map(s => (
                    <div key={s._id} className="card">
                      <div className="card-body">
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>📅 {new Date(s.date).toLocaleDateString()}</div>
                        <div style={{ color: "var(--nhs-dark-grey)", fontSize: 13, marginBottom: 12 }}>🕐 {new Date(s.date).toLocaleTimeString()}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--nhs-blue)", marginBottom: 12 }}>£{s.price}</div>
                        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleBook(s._id)}>Book Appointment</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {doctors.map(d => (
                <div key={d._id} className="card">
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div className="avatar" style={{ width: 48, height: 48, fontSize: 20 }}>{d.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Dr. {d.name}</div>
                        <div style={{ fontSize: 13, color: "var(--nhs-dark-grey)" }}>{d.email}</div>
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ marginBottom: 12 }}>✓ Approved</span>
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleViewSlots(d._id, d.name)}>View Available Slots</button>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && <div style={{ gridColumn: "1/-1" }}><div className="empty-state"><div className="empty-icon">👨‍⚕️</div><h3>No doctors available yet</h3></div></div>}
            </div>
          )}
        </div>
      </div>
    );

    if (path === "/patient/appointments") return (
      <div>
        <div className="page-header"><h1>My Appointments</h1></div>
        <div style={{ padding: "0 32px" }}>
          {appointments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><h3>No appointments yet</h3><p>Book your first appointment with a doctor</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.href = "/patient/doctors"}>Find a Doctor</button></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date & Time</th><th>Status</th><th>Price</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleString()}</td>
                      <td><span className={`badge ${a.status === "booked" ? "badge-green" : "badge-red"}`}>{a.status}</span></td>
                      <td>£{a.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );

    if (path === "/patient/prescriptions") return (
      <div>
        <div className="page-header"><h1>My Prescriptions</h1><p>Prescriptions issued by your doctors</p></div>
        <div style={{ padding: "0 32px" }}>
          {prescriptions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💊</div><h3>No prescriptions yet</h3></div>
          ) : prescriptions.map(p => (
            <div key={p._id} className="prescription-card">
              <div className="prescription-header">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Dr. {p.doctor?.name}</div>
                  <div style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  {p.diagnosis && <div className="badge badge-blue" style={{ marginTop: 8 }}>Diagnosis: {p.diagnosis}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {p.blockchainTxHash && <span className="badge badge-blue">⛓️ Blockchain Verified</span>}
                  <button className="btn btn-outline btn-sm" onClick={() => generatePrescriptionPDF(p, p.doctor?.name)}>PDF</button>
                </div>
              </div>
              <div className="medicine-list">
                {p.medicines?.map((m, i) => (
                  <div key={i} className="medicine-item">
                    <span style={{ fontWeight: 500 }}>💊 {m.name} — {m.dosage}</span>
                    <span style={{ color: "var(--nhs-dark-grey)" }}>{m.frequency} for {m.duration}</span>
                  </div>
                ))}
              </div>
              {p.notes && <div style={{ marginTop: 12, fontSize: 14, color: "var(--nhs-dark-grey)", background: "#f8f9fa", padding: "8px 12px", borderRadius: 6 }}>📝 {p.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    );

    if (path === "/patient/billing") return (
      <div>
        <div className="page-header"><h1>My Bills</h1><p>Manage and pay your medical bills</p></div>
        <div style={{ padding: "0 32px" }}>
          <MetaMaskBar />
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            💡 You can pay bills using <strong>MetaMask (ETH)</strong> for blockchain-verified payments, or the standard payment method.
          </div>
          {bills.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💳</div><h3>No bills yet</h3></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bills.map(b => (
                <div key={b._id} className="card">
                  <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--nhs-dark-grey)" }}>Bill #{b._id.slice(-8)}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--nhs-dark-blue)", margin: "4px 0" }}>£{b.amount}</div>
                      <div style={{ fontSize: 13, color: "var(--nhs-dark-grey)" }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`badge ${b.status === "paid" ? "badge-green" : "badge-orange"}`} style={{ fontSize: 14 }}>{b.status}</span>
                      {b.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-metamask" disabled={payingBill === b._id} onClick={() => handlePayMetaMask(b)}>
                            🦊 {payingBill === b._id ? "Processing..." : "Pay with MetaMask"}
                          </button>
                          <button className="btn btn-success" onClick={() => handlePayNormal(b._id)}>
                            Pay Standard
                          </button>
                        </div>
                      )}
                      {b.status === "paid" && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 20 }}>✅</span>
                          <button className="btn btn-outline btn-sm" onClick={() => generateBillPDF(b, user?.name)}>Receipt</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    if (path === "/patient/history") return (
      <div>
        <div className="page-header"><h1>Medical History</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card">
              <div className="card-header"><h3>Appointment History</h3></div>
              <div className="card-body">
                {appointments.map(a => (
                  <div key={a._id} style={{ padding: "10px 0", borderBottom: "1px dashed #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{new Date(a.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)" }}>{new Date(a.date).toLocaleTimeString()}</div>
                    </div>
                    <span className={`badge ${a.status === "booked" ? "badge-green" : "badge-red"}`}>{a.status}</span>
                  </div>
                ))}
                {appointments.length === 0 && <p style={{ color: "var(--nhs-dark-grey)", fontSize: 14 }}>No appointment history</p>}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3>Prescription History</h3></div>
              <div className="card-body">
                {prescriptions.map(p => (
                  <div key={p._id} style={{ padding: "10px 0", borderBottom: "1px dashed #f0f0f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Dr. {p.doctor?.name}</div>
                      <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)" }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    {p.diagnosis && <div className="badge badge-blue" style={{ fontSize: 11 }}>{p.diagnosis}</div>}
                  </div>
                ))}
                {prescriptions.length === 0 && <p style={{ color: "var(--nhs-dark-grey)", fontSize: 14 }}>No prescription history</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return <div className="page-header"><h1>Welcome, {user?.name}</h1></div>;
  };

  return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content">{renderPage()}</div>
    </div>
  );
};

export default PatientDashboard;