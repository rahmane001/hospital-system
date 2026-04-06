import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getAppointments, createAppointment, getDoctorBills, getDoctorPrescriptions, createPrescription, getUsers, getDoctorProfile, createDoctorProfile, updateDoctorProfile } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { generatePrescriptionPDF } from "../../utils/pdfGenerator";

const DoctorDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ specialization: "", experience: "", phone: "", clinicAddress: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", price: "" });
  const [rxForm, setRxForm] = useState({ patient: "", diagnosis: "", notes: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }] });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, b, p, u] = await Promise.all([getAppointments(), getDoctorBills(), getDoctorPrescriptions(), getUsers()]);
      setAppointments(a.data);
      setBills(b.data);
      setPrescriptions(p.data);
      setPatients(u.data.filter(u => u.role === "patient"));
      // Load doctor profile
      try {
        const prof = await getDoctorProfile(user._id);
        setProfile(prof.data);
        setProfileForm({
          specialization: prof.data.specialization || "",
          experience: prof.data.experience || "",
          phone: prof.data.phone || "",
          clinicAddress: prof.data.clinicAddress || ""
        });
      } catch { setProfile(null); }
    } catch (err) { toast.error("Failed to load"); }
    setLoading(false);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(slotForm);
      toast.success("Appointment slot created!");
      setShowSlotModal(false);
      setSlotForm({ date: "", price: "" });
      loadAll();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to create slot"); }
  };

  const handleCreateRx = async (e) => {
    e.preventDefault();
    try {
      await createPrescription(rxForm);
      toast.success("Prescription issued! Patient notified.");
      setShowRxModal(false);
      setRxForm({ patient: "", diagnosis: "", notes: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }] });
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create prescription"); }
  };

  const addMedicine = () => setRxForm({ ...rxForm, medicines: [...rxForm.medicines, { name: "", dosage: "", frequency: "", duration: "" }] });
  const removeMedicine = (i) => setRxForm({ ...rxForm, medicines: rxForm.medicines.filter((_, idx) => idx !== i) });
  const updateMedicine = (i, field, val) => {
    const meds = [...rxForm.medicines];
    meds[i][field] = val;
    setRxForm({ ...rxForm, medicines: meds });
  };

  if (loading) return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content"><div className="loading-container"><div className="spinner" /></div></div>
    </div>
  );

  const renderPage = () => {
    if (path === "/doctor") return (
      <div>
        <div className="page-header">
          <h1>Welcome, Dr. {user?.name}</h1>
          <p>Your practice overview</p>
        </div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon">📅</span><div className="stat-info"><h3>{appointments.length}</h3><p>Total Slots</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">✅</span><div className="stat-info"><h3>{appointments.filter(a => a.status === "booked").length}</h3><p>Booked</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">💳</span><div className="stat-info"><h3>£{bills.reduce((s, b) => s + b.amount, 0)}</h3><p>Total Billed</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-red)" }}><span className="stat-icon">💊</span><div className="stat-info"><h3>{prescriptions.length}</h3><p>Prescriptions</p></div></div>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <button className="btn btn-primary" onClick={() => setShowSlotModal(true)}>+ Add Appointment Slot</button>
            <button className="btn btn-success" onClick={() => setShowRxModal(true)}>+ Issue Prescription</button>
          </div>

          <div className="table-container">
            <div className="table-header"><h3>Recent Appointments</h3></div>
            <table>
              <thead><tr><th>Patient</th><th>Date & Time</th><th>Status</th><th>Price</th></tr></thead>
              <tbody>
                {appointments.slice(0, 8).map(a => (
                  <tr key={a._id}>
                    <td>{a.patientId?.name || "—"}</td>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td><span className={`badge ${a.status === "booked" ? "badge-green" : a.status === "cancelled" ? "badge-red" : "badge-blue"}`}>{a.status}</span></td>
                    <td style={{ fontWeight: 500 }}>£{a.price}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan={4}><div className="empty-state"><div className="empty-icon">📅</div><p>No appointments yet — add your first slot!</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/doctor/appointments") return (
      <div>
        <div className="page-header">
          <h1>My Appointments</h1>
          <div className="header-actions"><button className="btn btn-primary" onClick={() => setShowSlotModal(true)}>+ Add Slot</button></div>
        </div>
        <div style={{ padding: "0 32px" }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Patient</th><th>Date & Time</th><th>Status</th><th>Price</th><th>Created</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{a.patientId?.name || "—"}</td>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td><span className={`badge ${a.status === "booked" ? "badge-green" : a.status === "cancelled" ? "badge-red" : "badge-blue"}`}>{a.status}</span></td>
                    <td>£{a.price}</td>
                    <td style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/doctor/prescriptions") return (
      <div>
        <div className="page-header">
          <h1>Prescriptions</h1>
          <div className="header-actions"><button className="btn btn-primary" onClick={() => setShowRxModal(true)}>+ Issue Prescription</button></div>
        </div>
        <div style={{ padding: "0 32px" }}>
          {prescriptions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💊</div><h3>No prescriptions issued yet</h3></div>
          ) : prescriptions.map(p => (
            <div key={p._id} className="prescription-card">
              <div className="prescription-header">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Patient: {p.patient?.name}</div>
                  <div style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  {p.diagnosis && <div style={{ marginTop: 4, fontSize: 14 }}>Diagnosis: <strong>{p.diagnosis}</strong></div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {p.blockchainTxHash && <span className="badge badge-blue">⛓️ Blockchain</span>}
                  <button className="btn btn-outline btn-sm" onClick={() => generatePrescriptionPDF(p, user?.name)}>PDF</button>
                </div>
              </div>
              <div className="medicine-list">
                {p.medicines?.map((m, i) => (
                  <div key={i} className="medicine-item">
                    <span style={{ fontWeight: 500 }}>💊 {m.name}</span>
                    <span style={{ color: "var(--nhs-dark-grey)" }}>{m.dosage} · {m.frequency} · {m.duration}</span>
                  </div>
                ))}
              </div>
              {p.notes && <div style={{ marginTop: 12, fontSize: 14, color: "var(--nhs-dark-grey)", fontStyle: "italic" }}>Notes: {p.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    );

    if (path === "/doctor/billing") return (
      <div>
        <div className="page-header"><h1>My Billing</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
            <div className="stat-card"><span className="stat-icon">💰</span><div className="stat-info"><h3>£{bills.reduce((s, b) => s + b.amount, 0)}</h3><p>Total Billed</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">✅</span><div className="stat-info"><h3>£{bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0)}</h3><p>Collected</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">⏳</span><div className="stat-info"><h3>£{bills.filter(b => b.status === "pending").reduce((s, b) => s + b.amount, 0)}</h3><p>Outstanding</p></div></div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Bill ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: "monospace" }}>{b._id.slice(-8)}</td>
                    <td style={{ fontWeight: 600 }}>£{b.amount}</td>
                    <td><span className={`badge ${b.status === "paid" ? "badge-green" : "badge-orange"}`}>{b.status}</span></td>
                    <td style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/doctor/profile") {
      const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
          if (profile) {
            await updateDoctorProfile(user._id, profileForm);
            toast.success("Profile updated!");
          } else {
            await createDoctorProfile(profileForm);
            toast.success("Profile created!");
          }
          setEditingProfile(false);
          loadAll();
        } catch (err) { toast.error(err.response?.data?.message || "Failed to save profile"); }
      };

      return (
        <div>
          <div className="page-header">
            <h1>My Profile</h1>
            {!editingProfile && (
              <div className="header-actions">
                <button className="btn btn-primary" onClick={() => setEditingProfile(true)}>
                  {profile ? "Edit Profile" : "Create Profile"}
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: "0 32px", maxWidth: 640 }}>
            {editingProfile ? (
              <form onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" placeholder="e.g. Cardiology" value={profileForm.specialization} onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input className="form-input" type="number" placeholder="e.g. 10" value={profileForm.experience} onChange={e => setProfileForm({ ...profileForm, experience: e.target.value })} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="e.g. 07700 900000" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic Address</label>
                  <textarea className="form-textarea" placeholder="Enter clinic address..." value={profileForm.clinicAddress} onChange={e => setProfileForm({ ...profileForm, clinicAddress: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary">Save Profile</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </form>
            ) : profile ? (
              <div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, background: "var(--nhs-blue)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ margin: 0 }}>Dr. {user?.name}</h2>
                      <p style={{ margin: 0, color: "var(--nhs-dark-grey)" }}>{user?.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><strong>Specialization</strong><p style={{ color: "var(--nhs-dark-grey)" }}>{profile.specialization || "Not set"}</p></div>
                    <div><strong>Experience</strong><p style={{ color: "var(--nhs-dark-grey)" }}>{profile.experience ? `${profile.experience} years` : "Not set"}</p></div>
                    <div><strong>Phone</strong><p style={{ color: "var(--nhs-dark-grey)" }}>{profile.phone || "Not set"}</p></div>
                    <div><strong>Clinic Address</strong><p style={{ color: "var(--nhs-dark-grey)" }}>{profile.clinicAddress || "Not set"}</p></div>
                  </div>
                </div>
                <div className="stats-grid" style={{ marginTop: 24 }}>
                  <div className="stat-card"><span className="stat-icon">📅</span><div className="stat-info"><h3>{appointments.length}</h3><p>Total Slots</p></div></div>
                  <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">💊</span><div className="stat-info"><h3>{prescriptions.length}</h3><p>Prescriptions</p></div></div>
                  <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">💳</span><div className="stat-info"><h3>£{bills.reduce((s, b) => s + b.amount, 0)}</h3><p>Total Billed</p></div></div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h3>No profile yet</h3>
                <p>Create your doctor profile to get started.</p>
                <button className="btn btn-primary" onClick={() => setEditingProfile(true)}>Create Profile</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return <div className="page-header"><h1>Welcome, Dr. {user?.name}</h1></div>;
  };

  return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content">
        {renderPage()}
      </div>

      {/* Add Slot Modal */}
      {showSlotModal && (
        <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Appointment Slot</h3><button className="btn-icon" onClick={() => setShowSlotModal(false)}>✕</button></div>
            <form onSubmit={handleCreateSlot}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Date & Time</label><input className="form-input" type="datetime-local" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Consultation Fee (£)</label><input className="form-input" type="number" placeholder="e.g. 50" value={slotForm.price} onChange={e => setSlotForm({ ...slotForm, price: e.target.value })} required min="1" /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowSlotModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Slot</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showRxModal && (
        <div className="modal-overlay" onClick={() => setShowRxModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Issue Prescription</h3><button className="btn-icon" onClick={() => setShowRxModal(false)}>✕</button></div>
            <form onSubmit={handleCreateRx}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Patient</label>
                    <select className="form-select" value={rxForm.patient} onChange={e => setRxForm({ ...rxForm, patient: e.target.value })} required>
                      <option value="">Select patient...</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diagnosis</label>
                    <input className="form-input" placeholder="e.g. Type 2 Diabetes" value={rxForm.diagnosis} onChange={e => setRxForm({ ...rxForm, diagnosis: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Medicines</label>
                    <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine}>+ Add</button>
                  </div>
                  {rxForm.medicines.map((m, i) => (
                    <div key={i} style={{ background: "#f8f9fa", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      <div className="form-row" style={{ marginBottom: 8 }}>
                        <input className="form-input" placeholder="Medicine name" value={m.name} onChange={e => updateMedicine(i, "name", e.target.value)} required />
                        <input className="form-input" placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={e => updateMedicine(i, "dosage", e.target.value)} required />
                      </div>
                      <div className="form-row">
                        <input className="form-input" placeholder="Frequency (e.g. twice daily)" value={m.frequency} onChange={e => updateMedicine(i, "frequency", e.target.value)} required />
                        <input className="form-input" placeholder="Duration (e.g. 7 days)" value={m.duration} onChange={e => updateMedicine(i, "duration", e.target.value)} required />
                      </div>
                      {rxForm.medicines.length > 1 && <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeMedicine(i)}>Remove</button>}
                    </div>
                  ))}
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Additional notes for the patient..." value={rxForm.notes} onChange={e => setRxForm({ ...rxForm, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowRxModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Issue Prescription ⛓️</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;