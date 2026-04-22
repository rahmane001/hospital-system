import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register as registerApi, walletLogin } from "../utils/api";
import { connectMetaMask, switchToGanache, isMetaMaskInstalled } from "../utils/metamask";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ShaderBackground from "../components/ShaderBackground";

const roleRoutes = { admin: "/admin", doctor: "/doctor", patient: "/patient", receptionist: "/receptionist" };

// ─── Glassmorphism shell used by Login & Register ──────────────────────────────
const AuthShell = ({ title, subtitle, children, footer }) => (
  <div style={{
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", fontFamily: "Space Grotesk, sans-serif", padding: "40px 20px",
  }}>
    <ShaderBackground opacity={0.7} />
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,7,26,0.65)", zIndex: 1 }} />

    <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 440 }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⛓</div>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 22, letterSpacing: "-0.3px" }}>HMS DApp</div>
        <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Blockchain Hospital Management</div>
      </div>

      {/* Glass card */}
      <div style={{
        background: "rgba(14,25,50,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{title}</h2>
        <p style={{ color: "#475569", fontSize: 13, marginBottom: 24 }}>{subtitle}</p>
        {children}
      </div>

      {footer}
    </div>
  </div>
);

// ─── MetaMask login button ────────────────────────────────────────────────────
const MetaMaskLoginBtn = ({ onSuccess }) => {
  const [state, setState] = useState("idle");
  const [address, setAddress] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleClick = async () => {
    if (!isMetaMaskInstalled()) {
      setState("error");
      setErrMsg("MetaMask not installed. Please install the extension.");
      return;
    }
    try {
      setState("connecting");
      await switchToGanache();
      const account = await connectMetaMask();
      setAddress(account);
      setState("signing");
      const message = `Sign in to HMS DApp: ${Date.now()}`;
      const signature = await window.ethereum.request({ method: "personal_sign", params: [message, account] });
      const { data } = await walletLogin({ walletAddress: account, signature, message });
      setState("done");
      toast.success(`Welcome back, ${data.name}!`);
      setTimeout(() => onSuccess(data), 600);
    } catch (err) {
      setState("error");
      const msg = err.response?.data?.message || err.message || "Connection failed.";
      setErrMsg(msg.includes("rejected") ? "Signature rejected." : msg);
    }
  };

  const cfg = {
    idle:       { label: "Sign in with MetaMask", icon: "🦊", bg: "linear-gradient(135deg, #f97316, #ea580c)", shadow: "0 4px 20px rgba(249,115,22,0.4)" },
    connecting: { label: "Connecting wallet…",    icon: "🦊", bg: "rgba(249,115,22,0.4)", shadow: "none" },
    signing:    { label: "Sign the message…",     icon: "✍️", bg: "rgba(249,115,22,0.4)", shadow: "none" },
    done:       { label: "Wallet verified!",      icon: "✓",  bg: "linear-gradient(135deg, #10b981, #059669)", shadow: "0 4px 20px rgba(16,185,129,0.4)" },
    error:      { label: "Try again",             icon: "⚠",  bg: "rgba(239,68,68,0.3)", shadow: "none" },
  }[state];
  const busy = state === "connecting" || state === "signing";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={busy || state === "done"}
        style={{
          width: "100%", padding: 13, borderRadius: 10, border: "none",
          background: cfg.bg, color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: busy ? "wait" : state === "done" ? "default" : "pointer",
          fontFamily: "Space Grotesk, sans-serif",
          boxShadow: cfg.shadow,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{cfg.icon}</span>
        {cfg.label}
        {busy && (
          <span style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
            animation: "spin 0.7s linear infinite", display: "inline-block",
          }} />
        )}
      </button>

      {state === "signing" && address && (
        <div style={{
          marginTop: 10, padding: "9px 12px",
          background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 8, fontSize: 12, color: "#fb923c",
        }}>
          🦊 Check MetaMask popup to sign the message
          <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#475569", marginTop: 3 }}>
            {address.slice(0, 8)}…{address.slice(-6)}
          </div>
        </div>
      )}

      {state === "error" && (
        <div style={{
          marginTop: 10, padding: "9px 12px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8, fontSize: 12, color: "#f87171",
        }}>
          ⚠ {errMsg}
        </div>
      )}

      {state === "done" && (
        <div style={{
          marginTop: 10, padding: "9px 12px",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 8, fontSize: 12, color: "#34d399",
        }}>
          ✓ Signature verified — redirecting…
        </div>
      )}
    </div>
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(roleRoutes[data.role] || "/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  const handleWalletSuccess = (data) => {
    loginUser(data, data.token);
    navigate(roleRoutes[data.role] || "/patient");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your hospital portal"
      footer={
        <div style={{ textAlign: "center", marginTop: 20, color: "#475569", fontSize: 13 }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>Register</Link>
          <span style={{ margin: "0 8px", color: "#1e293b" }}>·</span>
          <Link to="/" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>← Home</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="admin@hms.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 13, borderRadius: 10, border: "none",
          background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          fontFamily: "Space Grotesk, sans-serif",
          boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
          marginTop: 4,
        }}>
          {loading ? "⟳ Authenticating…" : "Sign In"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ color: "#334155", fontSize: 12, fontWeight: 600, letterSpacing: "0.5px" }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      <MetaMaskLoginBtn onSuccess={handleWalletSuccess} />
    </AuthShell>
  );
};

// ─── Register ─────────────────────────────────────────────────────────────────
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

  const roles = ["patient", "doctor", "receptionist", "admin"];

  return (
    <AuthShell
      title="Create account"
      subtitle="Register to access the system"
      footer={
        <div style={{ textAlign: "center", marginTop: 20, color: "#475569", fontSize: 13 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          <span style={{ margin: "0 8px", color: "#1e293b" }}>·</span>
          <Link to="/" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>← Home</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="Dr. Jane Smith" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@hospital.io" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {roles.map(r => {
              const active = form.role === r;
              return (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} style={{
                  padding: 9, borderRadius: 8,
                  border: `1px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                  color: active ? "#60a5fa" : "#64748b",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif", textTransform: "capitalize",
                  transition: "all 0.15s",
                }}>
                  {r}
                </button>
              );
            })}
          </div>
          {form.role === "doctor" && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#fbbf24" }}>
              ⓘ Doctor accounts require admin approval before login.
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 13, borderRadius: 10, border: "none",
          background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          fontFamily: "Space Grotesk, sans-serif",
          boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
          marginTop: 4,
        }}>
          {loading ? "⟳ Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
