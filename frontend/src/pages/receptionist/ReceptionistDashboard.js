import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getUsers, getBeds, getDepartments, assignBed, releaseBed, getAdminBills, adminGetAllAppointments } from "../../utils/api";
import { toast } from "react-toastify";

const ReceptionistDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [assignPatient, setAssignPatient] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, b, d, bi, a] = await Promise.all([
        getUsers(), getBeds(), getDepartments(), getAdminBills(), adminGetAllAppointments()
      ]);
      setPatients(u.data.filter(u => u.role === "patient"));
      setBeds(b.data);
      setDepartments(d.data);
      setBills(bi.data);
      setAppointments(a.data);
    } catch (err) { toast.error("Failed to load data"); }
    setLoading(false);
  };

  const handleAssignBed = async (e) => {
    e.preventDefault();
    try {
      await assignBed(selectedBed._id, { patientId: assignPatient });
      toast.success("Bed assigned!");
      setShowAssignModal(false);
      setAssignPatient("");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to assign bed"); }
  };

  const handleReleaseBed = async (id) => {
    try {
      await releaseBed(id);
      toast.success("Bed released!");
      loadAll();
    } catch (err) { toast.error("Failed"); }
  };

  if (loading) return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content"><div className="loading-container"><div className="spinner" /></div></div>
    </div>
  );

  const renderPage = () => {
    if (path === "/receptionist") return (
      <div>
        <div className="page-header"><h1>Receptionist Dashboard</h1><p>Front desk overview</p></div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon">👥</span><div className="stat-info"><h3>{patients.length}</h3><p>Registered Patients</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">🛏️</span><div className="stat-info"><h3>{beds.filter(b => b.status === "available").length}</h3><p>Available Beds</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">📅</span><div className="stat-info"><h3>{appointments.filter(a => a.status === "booked").length}</h3><p>Today's Appointments</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-red)" }}><span className="stat-icon">💳</span><div className="stat-info"><h3>{bills.filter(b => b.status === "pending").length}</h3><p>Pending Bills</p></div></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card">
              <div className="card-header"><h3>Recent Patients</h3></div>
              <div className="card-body">
                {patients.slice(0, 6).map(p => (
                  <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px dashed #f0f0f0" }}>
                    <div className="avatar">{p.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)" }}>{p.email}</div>
                    </div>
                  </div>
                ))}
                {patients.length === 0 && <p style={{ color: "var(--nhs-dark-grey)", fontSize: 14 }}>No patients registered yet</p>}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3>Bed Status Summary</h3></div>
              <div className="card-body">
                {departments.map(d => {
                  const dBeds = beds.filter(b => b.department?._id === d._id || b.department === d._id);
                  const avail = dBeds.filter(b => b.status === "available").length;
                  return (
                    <div key={d._id} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                        <span style={{ fontWeight: 500 }}>{d.name}</span>
                        <span style={{ color: avail > 0 ? "var(--nhs-green)" : "var(--nhs-red)", fontWeight: 600 }}>{avail}/{dBeds.length}</span>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                        <div style={{ background: avail > 0 ? "var(--nhs-green)" : "var(--nhs-red)", height: 8, borderRadius: 4, width: dBeds.length > 0 ? `${(avail / dBeds.length) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  );
                })}
                {departments.length === 0 && <p style={{ color: "var(--nhs-dark-grey)", fontSize: 14 }}>No departments configured</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (path === "/receptionist/register") return (
      <div>
        <div className="page-header"><h1>Registered Patients</h1><p>All patients in the system</p></div>
        <div style={{ padding: "0 32px" }}>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            ℹ️ Patients self-register through the <strong>/register</strong> page. This view shows all registered patients.
          </div>
          <div className="table-container">
            <div className="table-header"><h3>All Patients ({patients.length})</h3></div>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Registered</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{p.name.charAt(0)}</div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </td>
                    <td style={{ color: "var(--nhs-dark-grey)" }}>{p.email}</td>
                    <td style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {patients.length === 0 && <tr><td colSpan={3}><div className="empty-state"><div className="empty-icon">👥</div><p>No patients registered yet</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/receptionist/appointments") return (
      <div>
        <div className="page-header"><h1>All Appointments</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Date & Time</th><th>Status</th><th>Price</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td><span className={`badge ${a.status === "booked" ? "badge-green" : a.status === "cancelled" ? "badge-red" : "badge-blue"}`}>{a.status}</span></td>
                    <td>£{a.price}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan={3}><div className="empty-state"><div className="empty-icon">📅</div><p>No appointments</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/receptionist/beds") return (
      <div>
        <div className="page-header"><h1>Bed Management</h1><p>Assign and manage patient beds</p></div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">✅</span><div className="stat-info"><h3>{beds.filter(b => b.status === "available").length}</h3><p>Available</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-red)" }}><span className="stat-icon">🛏️</span><div className="stat-info"><h3>{beds.filter(b => b.status === "occupied").length}</h3><p>Occupied</p></div></div>
            <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">🔧</span><div className="stat-info"><h3>{beds.filter(b => b.status === "maintenance").length}</h3><p>Maintenance</p></div></div>
          </div>

          {departments.map(dept => {
            const deptBeds = beds.filter(b => b.department?._id === dept._id || b.department === dept._id);
            if (deptBeds.length === 0) return null;
            return (
              <div key={dept._id} className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h3>{dept.name}</h3></div>
                <div className="card-body">
                  <div className="beds-grid">
                    {deptBeds.map(bed => (
                      <div key={bed._id} className={`bed-card ${bed.status}`}>
                        <div className="bed-number">{bed.bedNumber}</div>
                        <div className="bed-status" style={{ color: bed.status === "available" ? "var(--nhs-green)" : bed.status === "occupied" ? "var(--nhs-red)" : "var(--nhs-yellow)" }}>{bed.status}</div>
                        {bed.patient && <div style={{ fontSize: 11, marginTop: 4, color: "var(--nhs-dark-grey)" }}>{bed.patient?.name}</div>}
                        <div style={{ marginTop: 8 }}>
                          {bed.status === "available" && (
                            <button className="btn btn-primary btn-sm" style={{ fontSize: 11, width: "100%" }} onClick={() => { setSelectedBed(bed); setShowAssignModal(true); }}>Assign</button>
                          )}
                          {bed.status === "occupied" && (
                            <button className="btn btn-outline btn-sm" style={{ fontSize: 11, width: "100%" }} onClick={() => handleReleaseBed(bed._id)}>Release</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {beds.length === 0 && <div className="empty-state"><div className="empty-icon">🛏️</div><h3>No beds configured</h3><p>Ask admin to add beds and departments</p></div>}
        </div>
      </div>
    );

    if (path === "/receptionist/billing") return (
      <div>
        <div className="page-header"><h1>Billing Overview</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Bill ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>{b._id.slice(-8)}</td>
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

    return <div className="page-header"><h1>Receptionist Dashboard</h1></div>;
  };

  return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content">{renderPage()}</div>

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Bed {selectedBed?.bedNumber}</h3>
              <button className="btn-icon" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignBed}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select className="form-select" value={assignPatient} onChange={e => setAssignPatient(e.target.value)} required>
                    <option value="">Choose patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Bed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;