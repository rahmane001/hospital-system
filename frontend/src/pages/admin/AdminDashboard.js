import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import MetaMaskBar from "../../components/MetaMaskBar";
import { getUsers, deleteUser, approveDoctor, getAdminBills, adminGetAllAppointments, getDepartments, createDepartment, deleteDepartment, getBeds, createBed, releaseBed, getAdminPrescriptions } from "../../utils/api";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import BlockchainPage from "./BlockchainPage";
import AuditPage from "./AuditPage";
import StatCard from "../../components/StatCard";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", description: "", totalBeds: 10 });
  const [bedForm, setBedForm] = useState({ bedNumber: "", department: "" });
  const [search, setSearch] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, b, a, d, be, p] = await Promise.all([
        getUsers(), getAdminBills(), adminGetAllAppointments(),
        getDepartments(), getBeds(), getAdminPrescriptions()
      ]);
      setUsers(u.data); setBills(b.data); setAppointments(a.data);
      setDepartments(d.data); setBeds(be.data); setPrescriptions(p.data);
    } catch (err) { toast.error("Failed to load data"); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try { await approveDoctor(id); toast.success("Doctor approved!"); loadAll(); }
    catch (err) { toast.error("Failed to approve"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await deleteUser(id); toast.success("User deleted"); loadAll(); }
    catch (err) { toast.error("Failed to delete"); }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try { await createDepartment(deptForm); toast.success("Department created!"); setShowDeptModal(false); setDeptForm({ name: "", description: "", totalBeds: 10 }); loadAll(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleCreateBed = async (e) => {
    e.preventDefault();
    try { await createBed(bedForm); toast.success("Bed added!"); setShowBedModal(false); setBedForm({ bedNumber: "", department: "" }); loadAll(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleReleaseBed = async (id) => {
    try { await releaseBed(id); toast.success("Bed released!"); loadAll(); }
    catch (err) { toast.error("Failed to release bed"); }
  };

  // Chart data
  const roleData = [
    { name: "Doctors", value: users.filter(u => u.role === "doctor").length },
    { name: "Patients", value: users.filter(u => u.role === "patient").length },
    { name: "Admins", value: users.filter(u => u.role === "admin").length },
  ];

  const apptStatusData = [
    { name: "Available", value: appointments.filter(a => a.status === "available").length },
    { name: "Booked", value: appointments.filter(a => a.status === "booked").length },
    { name: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length },
  ];

  const billingData = [
    { name: "Pending", value: bills.filter(b => b.status === "pending").length, amount: bills.filter(b => b.status === "pending").reduce((s, b) => s + b.amount, 0) },
    { name: "Paid", value: bills.filter(b => b.status === "paid").length, amount: bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0) },
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content"><div className="loading-container"><div className="spinner" /></div></div>
    </div>
  );

  const renderPage = () => {
    if (path === "/admin") return (
      <div>
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Hospital overview and analytics</p>
        </div>
        <div style={{ padding: "0 32px" }}>
          <MetaMaskBar />
          <div className="stats-grid">
            <StatCard label="Total Users" value={users.length} icon="👥" color="#3b82f6" />
            <StatCard label="Appointments" value={appointments.length} icon="📅" color="#10b981" />
            <StatCard label="Total Revenue" value={`£${bills.reduce((s, b) => s + b.amount, 0)}`} icon="💳" color="#ef4444" />
            <StatCard label="Beds Available" value={`${beds.filter(b => b.status === "available").length}/${beds.length}`} icon="🛏️" color="#f59e0b" />
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header"><h3>User Distribution</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Appointment Status</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={apptStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Billing Overview</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={billingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => `£${v}`} />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Department Capacity</h3></div>
              <div className="card-body">
                {departments.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">🏥</div><p>No departments yet</p></div>
                ) : (
                  departments.map(d => (
                    <div key={d._id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                        <span>{d.name}</span>
                        <span style={{ color: "var(--nhs-dark-grey)" }}>{d.availableBeds}/{d.totalBeds} beds</span>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                        <div style={{ background: "var(--nhs-blue)", height: 8, borderRadius: 4, width: `${(d.availableBeds / d.totalBeds) * 100}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (path === "/admin/analytics") {
      // Monthly revenue from paid bills
      const revenueByMonth = {};
      bills.filter(b => b.status === "paid").forEach(b => {
        const d = new Date(b.updatedAt || b.createdAt);
        const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + b.amount;
      });
      const revenueData = Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue }));

      // Appointments per doctor
      const apptByDoctor = {};
      appointments.forEach(a => {
        const name = a.doctorId?.name || "Unknown";
        apptByDoctor[name] = (apptByDoctor[name] || 0) + 1;
      });
      const doctorApptData = Object.entries(apptByDoctor).map(([name, count]) => ({ name, count }));

      // Prescription volume by diagnosis (top 5)
      const rxByDiagnosis = {};
      prescriptions.forEach(p => {
        const key = p.diagnosis || "Unspecified";
        rxByDiagnosis[key] = (rxByDiagnosis[key] || 0) + 1;
      });
      const diagnosisData = Object.entries(rxByDiagnosis)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Blockchain activity summary (records with tx hash)
      const onChainPrescriptions = prescriptions.filter(p => p.blockchainTxHash).length;
      const onChainBills = bills.filter(b => b.blockchainTxHash).length;
      const totalPaid = bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
      const avgBill = bills.length > 0 ? (bills.reduce((s, b) => s + b.amount, 0) / bills.length).toFixed(2) : 0;

      return (
        <div>
          <div className="page-header">
            <h1>Analytics</h1>
            <p>Deep insights into hospital operations</p>
          </div>
          <div style={{ padding: "0 32px" }}>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <StatCard label="Total Revenue Collected" value={`£${totalPaid}`} icon="💰" color="#10b981" />
              <StatCard label="Average Bill" value={`£${avgBill}`} icon="📊" color="#3b82f6" />
              <StatCard label="On-Chain Records" value={onChainPrescriptions + onChainBills} icon="⛓️" color="#8b5cf6" />
              <StatCard label="Total Prescriptions" value={prescriptions.length} icon="💊" color="#ef4444" />
            </div>

            <div className="charts-grid">
              <div className="card">
                <div className="card-header"><h3>Monthly Revenue Trend</h3></div>
                <div className="card-body">
                  {revenueData.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📈</div><p>No paid bills yet</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(v) => `£${v}`} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Appointments per Doctor</h3></div>
                <div className="card-body">
                  {doctorApptData.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">👨‍⚕️</div><p>No appointments yet</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={doctorApptData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Top Diagnoses (Prescriptions)</h3></div>
                <div className="card-body">
                  {diagnosisData.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">💊</div><p>No prescriptions yet</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={diagnosisData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis type="category" dataKey="name" fontSize={12} width={120} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Blockchain Activity</h3></div>
                <div className="card-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                        <span>Prescriptions on-chain</span>
                        <strong>{onChainPrescriptions}/{prescriptions.length}</strong>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                        <div style={{ background: "var(--nhs-red)", height: 8, borderRadius: 4, width: `${prescriptions.length > 0 ? (onChainPrescriptions / prescriptions.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                        <span>Bills on-chain</span>
                        <strong>{onChainBills}/{bills.length}</strong>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                        <div style={{ background: "var(--nhs-green)", height: 8, borderRadius: 4, width: `${bills.length > 0 ? (onChainBills / bills.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div style={{ marginTop: 8, padding: 12, background: "var(--nhs-pale-grey)", borderRadius: 8, fontSize: 13, color: "var(--nhs-dark-grey)" }}>
                      All records are immutably logged to the Ganache smart contract at deploy time. View full verification at <strong>Blockchain Logs</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (path === "/admin/users") return (
      <div>
        <div className="page-header"><h1>User Management</h1><p>Manage all hospital users</p></div>
        <div style={{ padding: "0 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="search-bar">
              🔍 <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-container">
            <div className="table-header">
              <h3>All Users ({filteredUsers.length})</h3>
            </div>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: "var(--nhs-dark-grey)" }}>{u.email}</td>
                    <td><span className={`badge ${u.role === "admin" ? "badge-blue" : u.role === "doctor" ? "badge-green" : "badge-orange"}`}>{u.role}</span></td>
                    <td>{u.role === "doctor" ? <span className={`badge ${u.doctorStatus === "approved" ? "badge-green" : "badge-yellow"}`}>{u.doctorStatus}</span> : <span className="badge badge-grey">—</span>}</td>
                    <td style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role === "doctor" && u.doctorStatus === "pending" && (
                        <button className="btn btn-success btn-sm" style={{ marginRight: 8 }} onClick={() => handleApprove(u._id)}>Approve</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/admin/departments") return (
      <div>
        <div className="page-header">
          <h1>Departments</h1>
          <p>Manage hospital departments</p>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowDeptModal(true)}>+ Add Department</button>
          </div>
        </div>
        <div style={{ padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {departments.map(d => (
              <div key={d._id} className="card">
                <div className="card-header">
                  <h3>{d.name}</h3>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteDepartment(d._id).then(loadAll)}>Delete</button>
                </div>
                <div className="card-body">
                  <p style={{ color: "var(--nhs-dark-grey)", fontSize: 14, marginBottom: 16 }}>{d.description || "No description"}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span>Available Beds:</span>
                    <strong style={{ color: "var(--nhs-green)" }}>{d.availableBeds}/{d.totalBeds}</strong>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8, marginTop: 8 }}>
                    <div style={{ background: "var(--nhs-green)", height: 8, borderRadius: 4, width: `${(d.availableBeds / d.totalBeds) * 100}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div style={{ gridColumn: "1/-1" }}>
                <div className="empty-state"><div className="empty-icon">🏥</div><h3>No departments yet</h3><p>Add your first department to get started</p></div>
              </div>
            )}
          </div>
        </div>
        {showDeptModal && (
          <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h3>Add Department</h3><button className="btn-icon" onClick={() => setShowDeptModal(false)}>✕</button></div>
              <form onSubmit={handleCreateDept}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Department Name</label><input className="form-input" placeholder="e.g. Cardiology" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Brief description..." value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Total Beds</label><input className="form-input" type="number" value={deptForm.totalBeds} onChange={e => setDeptForm({ ...deptForm, totalBeds: e.target.value })} /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowDeptModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    );

    if (path === "/admin/beds") return (
      <div>
        <div className="page-header">
          <h1>Bed Management</h1>
          <p>Real-time bed availability</p>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowBedModal(true)}>+ Add Bed</button>
          </div>
        </div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
            <StatCard label="Available" value={beds.filter(b => b.status === "available").length} icon="✅" color="#10b981" />
            <StatCard label="Occupied" value={beds.filter(b => b.status === "occupied").length} icon="🛏️" color="#ef4444" />
            <StatCard label="Maintenance" value={beds.filter(b => b.status === "maintenance").length} icon="🔧" color="#f59e0b" />
          </div>

          {departments.map(dept => {
            const deptBeds = beds.filter(b => b.department?._id === dept._id || b.department === dept._id);
            if (deptBeds.length === 0) return null;
            return (
              <div key={dept._id} className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h3>{dept.name}</h3><span style={{ color: "var(--nhs-dark-grey)", fontSize: 14 }}>{deptBeds.filter(b => b.status === "available").length} available</span></div>
                <div className="card-body">
                  <div className="beds-grid">
                    {deptBeds.map(bed => (
                      <div key={bed._id} className={`bed-card ${bed.status}`}>
                        <div className="bed-number">{bed.bedNumber}</div>
                        <div className="bed-status" style={{ color: bed.status === "available" ? "var(--nhs-green)" : bed.status === "occupied" ? "var(--nhs-red)" : "var(--nhs-yellow)" }}>{bed.status}</div>
                        {bed.patient && <div style={{ fontSize: 11, marginTop: 4, color: "var(--nhs-dark-grey)" }}>{bed.patient?.name}</div>}
                        {bed.status === "occupied" && (
                          <button className="btn btn-outline btn-sm" style={{ marginTop: 8, fontSize: 11 }} onClick={() => handleReleaseBed(bed._id)}>Release</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {beds.length === 0 && <div className="empty-state"><div className="empty-icon">🛏️</div><h3>No beds added yet</h3></div>}
        </div>

        {showBedModal && (
          <div className="modal-overlay" onClick={() => setShowBedModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h3>Add Bed</h3><button className="btn-icon" onClick={() => setShowBedModal(false)}>✕</button></div>
              <form onSubmit={handleCreateBed}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Bed Number</label><input className="form-input" placeholder="e.g. A-101" value={bedForm.bedNumber} onChange={e => setBedForm({ ...bedForm, bedNumber: e.target.value })} required /></div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={bedForm.department} onChange={e => setBedForm({ ...bedForm, department: e.target.value })} required>
                      <option value="">Select department...</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowBedModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Bed</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    );

    if (path === "/admin/appointments") return (
      <div>
        <div className="page-header"><h1>All Appointments</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div className="table-container">
            <table>
              <thead><tr><th>ID</th><th>Doctor</th><th>Patient</th><th>Date</th><th>Status</th><th>Price</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>{a._id.slice(-8)}</td>
                    <td>{a.doctorId?.name || "—"}</td>
                    <td>{a.patientId?.name || "—"}</td>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td><span className={`badge ${a.status === "booked" ? "badge-green" : a.status === "cancelled" ? "badge-red" : "badge-blue"}`}>{a.status}</span></td>
                    <td>£{a.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (path === "/admin/billing") return (
      <div>
        <div className="page-header"><h1>Billing Management</h1></div>
        <div style={{ padding: "0 32px" }}>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
            <StatCard label="Total Billed" value={`£${bills.reduce((s, b) => s + b.amount, 0)}`} icon="💰" color="#3b82f6" />
            <StatCard label="Collected" value={`£${bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0)}`} icon="✅" color="#10b981" />
            <StatCard label="Outstanding" value={`£${bills.filter(b => b.status === "pending").reduce((s, b) => s + b.amount, 0)}`} icon="⏳" color="#f59e0b" />
          </div>
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

    if (path === "/admin/prescriptions") return (
      <div>
        <div className="page-header"><h1>All Prescriptions</h1></div>
        <div style={{ padding: "0 32px" }}>
          {prescriptions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💊</div><h3>No prescriptions yet</h3></div>
          ) : prescriptions.map(p => (
            <div key={p._id} className="prescription-card">
              <div className="prescription-header">
                <div>
                  <div style={{ fontWeight: 600 }}>Patient: {p.patient?.name}</div>
                  <div style={{ fontSize: 13, color: "var(--nhs-dark-grey)" }}>Dr. {p.doctor?.name} • {new Date(p.createdAt).toLocaleDateString()}</div>
                  {p.diagnosis && <div style={{ marginTop: 4, fontSize: 14 }}>Diagnosis: <strong>{p.diagnosis}</strong></div>}
                </div>
                {p.blockchainTxHash && <span className="badge badge-blue">⛓️ On-chain</span>}
              </div>
              <div className="medicine-list">
                {p.medicines?.map((m, i) => (
                  <div key={i} className="medicine-item">
                    <span style={{ fontWeight: 500 }}>💊 {m.name}</span>
                    <span style={{ color: "var(--nhs-dark-grey)" }}>{m.dosage} • {m.frequency} • {m.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (path === "/admin/blockchain") return <BlockchainPage prescriptions={prescriptions} bills={bills} />;

    if (path === "/admin/audit") return <AuditPage />;

    return <div className="page-header"><h1>Page not found</h1></div>;
  };

  return (
    <div className="layout">
      <Sidebar activePath={path} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
};

export default AdminDashboard;