import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register as registerApi, walletLogin } from "../utils/api";
import { connectMetaMask, switchToGanache, isMetaMaskInstalled } from "../utils/metamask";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleMetaMaskLogin = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask is not installed. Please install it to use wallet login.");
      return;
    }
    setWalletLoading(true);
    try {
      await switchToGanache();
      const account = await connectMetaMask();
      const message = `Sign in to HMS DApp: ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });
      const { data } = await walletLogin({ walletAddress: account, signature, message });
      loginUser(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
      const routes = { admin: "/admin", doctor: "/doctor", patient: "/patient", receptionist: "/receptionist" };
      navigate(routes[data.role] || "/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "MetaMask login failed");
    }
    setWalletLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
      const routes = { admin: "/admin", doctor: "/doctor", patient: "/patient", receptionist: "/receptionist" };
      navigate(routes[data.role] || "/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandTitle}>🏥 HMS DApp</h1>
          <p style={styles.brandDesc}>Hospital Management System — Blockchain Powered</p>
          <div style={{ marginTop: 40 }}>
            {["Secure patient records on blockchain", "MetaMask payment integration", "Real-time appointment management", "Role-based access control"].map(f => (
              <div key={f} style={styles.feature}>✓ {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSubtitle}>Access your HMS dashboard</p>
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@hospital.nhs.uk" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 16, marginTop: 8 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#ddd" }} />
            <span style={{ color: "#999", fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#ddd" }} />
          </div>

          <button
            className="btn btn-metamask"
            onClick={handleMetaMaskLogin}
            disabled={walletLoading}
            style={{ width: "100%", padding: "12px", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            🦊 {walletLoading ? "Connecting..." : "Sign in with MetaMask"}
          </button>

          <p style={styles.switchText}>Don't have an account? <Link to="/register" style={{ color: "var(--nhs-blue)", fontWeight: 600 }}>Register</Link></p>
          <p style={styles.switchText}><Link to="/" style={{ color: "var(--nhs-dark-grey)", fontSize: 13 }}>← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      toast.success("Account created! Please sign in.");
      if (form.role === "doctor") toast.info("Doctor accounts require admin approval before login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandTitle}>🏥 HMS DApp</h1>
          <p style={styles.brandDesc}>Join the blockchain-powered hospital management platform</p>
          <div style={{ marginTop: 40 }}>
            <div style={styles.roleCard}>
              <strong>👤 Patient</strong>
              <p>Book appointments, view prescriptions, pay bills</p>
            </div>
            <div style={styles.roleCard}>
              <strong>👨‍⚕️ Doctor</strong>
              <p>Manage slots, issue prescriptions, track billing</p>
            </div>
          </div>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSubtitle}>Register for HMS DApp</p>
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Dr. John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@hospital.nhs.uk" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Register As</label>
              <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor (requires admin approval)</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 16 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p style={styles.switchText}>Already have an account? <Link to="/login" style={{ color: "var(--nhs-blue)", fontWeight: 600 }}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", minHeight: "100vh" },
  left: { flex: 1, background: "linear-gradient(135deg, var(--nhs-dark-blue), var(--nhs-blue))", display: "flex", alignItems: "center", padding: "48px" },
  leftContent: { color: "white", maxWidth: 440 },
  brandTitle: { fontSize: 36, fontFamily: "Fraunces, serif", fontWeight: 700, marginBottom: 8 },
  brandDesc: { fontSize: 16, opacity: 0.85, lineHeight: 1.6 },
  feature: { padding: "10px 0", fontSize: 15, opacity: 0.9, borderBottom: "1px solid rgba(255,255,255,0.1)" },
  roleCard: { background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "16px", marginBottom: 12 },
  right: { width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "white" },
  formBox: { width: "100%" },
  formTitle: { fontSize: 30, color: "var(--nhs-dark-blue)", fontFamily: "Fraunces, serif" },
  formSubtitle: { color: "var(--nhs-dark-grey)", marginTop: 4, fontSize: 15 },
  switchText: { textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--nhs-dark-grey)" },
};

export default Login;