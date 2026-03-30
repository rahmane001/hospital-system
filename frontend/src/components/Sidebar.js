import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const adminNav = [
  { section: "Overview", items: [
    { icon: "📊", label: "Dashboard", path: "/admin" },
    { icon: "📈", label: "Analytics", path: "/admin/analytics" },
  ]},
  { section: "Management", items: [
    { icon: "👥", label: "Users", path: "/admin/users" },
    { icon: "🏥", label: "Departments", path: "/admin/departments" },
    { icon: "🛏️", label: "Beds", path: "/admin/beds" },
    { icon: "📅", label: "Appointments", path: "/admin/appointments" },
    { icon: "💊", label: "Prescriptions", path: "/admin/prescriptions" },
    { icon: "💳", label: "Billing", path: "/admin/billing" },
  ]},
  { section: "Blockchain", items: [
    { icon: "⛓️", label: "Blockchain Logs", path: "/admin/blockchain" },
  ]},
  { section: "Security", items: [
    { icon: "📋", label: "Audit Log", path: "/admin/audit" },
  ]},
];

const doctorNav = [
  { section: "Overview", items: [
    { icon: "📊", label: "Dashboard", path: "/doctor" },
  ]},
  { section: "Practice", items: [
    { icon: "📅", label: "My Appointments", path: "/doctor/appointments" },
    { icon: "💊", label: "Prescriptions", path: "/doctor/prescriptions" },
    { icon: "💳", label: "Billing", path: "/doctor/billing" },
    { icon: "👤", label: "My Profile", path: "/doctor/profile" },
  ]},
];

const patientNav = [
  { section: "Overview", items: [
    { icon: "📊", label: "Dashboard", path: "/patient" },
  ]},
  { section: "My Care", items: [
    { icon: "🔍", label: "Find Doctors", path: "/patient/doctors" },
    { icon: "📅", label: "My Appointments", path: "/patient/appointments" },
    { icon: "💊", label: "Prescriptions", path: "/patient/prescriptions" },
    { icon: "💳", label: "My Bills", path: "/patient/billing" },
    { icon: "📋", label: "Medical History", path: "/patient/history" },
  ]},
];

const receptionistNav = [
  { section: "Overview", items: [
    { icon: "📊", label: "Dashboard", path: "/receptionist" },
  ]},
  { section: "Front Desk", items: [
    { icon: "👤", label: "Register Patient", path: "/receptionist/register" },
    { icon: "📅", label: "Appointments", path: "/receptionist/appointments" },
    { icon: "🛏️", label: "Bed Management", path: "/receptionist/beds" },
    { icon: "💳", label: "Billing", path: "/receptionist/billing" },
  ]},
];

const navByRole = { admin: adminNav, doctor: doctorNav, patient: patientNav, receptionist: receptionistNav };

const Sidebar = ({ activePath }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navByRole[user?.role] || patientNav;

  const handleNav = (path) => navigate(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>🏥 HMS DApp</h2>
          <span>Hospital Management System</span>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        {nav.map((section) => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${activePath === item.path ? "active" : ""}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;