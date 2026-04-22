import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShaderBackground from "../components/ShaderBackground";

const FEATURES = [
  { icon: "🔐", title: "Role-Based Access", desc: "Admin, Doctor, Patient & Receptionist portals with JWT authentication and granular permissions." },
  { icon: "⛓️", title: "Immutable Records", desc: "Patient records, prescriptions and billing transactions logged permanently on Ethereum via Solidity smart contracts." },
  { icon: "🦊", title: "MetaMask Payments", desc: "Pay hospital bills with real ETH transactions on Ganache. Full on-chain payment verification." },
  { icon: "💊", title: "Digital Prescriptions", desc: "Doctors issue hashed prescriptions stored on-chain — tamper-proof and instantly verifiable." },
  { icon: "🛏️", title: "Bed Management", desc: "Real-time bed availability across all departments. Instant assign and release workflows." },
  { icon: "📊", title: "Analytics Engine", desc: "Revenue trends, appointment volumes, blockchain activity — all in one live dashboard." },
];

const STATS = [
  { num: "100%", label: "On-chain Secured" },
  { num: "4",    label: "User Roles" },
  { num: "ETH",  label: "Payments" },
  { num: "Live", label: "Blockchain Sync" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "Space Grotesk, sans-serif", overflowX: "hidden", background: "#030b1a" }}>
      <ShaderBackground opacity={1} />

      {/* Overlay gradient */}
      <div style={{
        position: "fixed", inset: 0,
        background: "linear-gradient(180deg, rgba(3,7,26,0.3) 0%, rgba(3,7,26,0.1) 50%, rgba(3,7,26,0.7) 100%)",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>⛓</span>
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>HMS DApp</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-outline" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "80px 48px 60px", maxWidth: 900, margin: "0 auto",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 20, fontSize: 13, color: "#60a5fa", fontWeight: 600, marginBottom: 28,
          backdropFilter: "blur(10px)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6", display: "inline-block" }} />
          Powered by Ethereum · Ganache · Solidity
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 700, lineHeight: 1.05,
          letterSpacing: "-2px", color: "#f1f5f9", marginBottom: 24,
        }}>
          Modern Hospital
          <br />
          <span style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            on the Blockchain
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, marginBottom: 40,
        }}>
          A fully decentralised hospital management system combining secure patient records,
          smart contract billing, and real-time appointment management.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => navigate("/register")}>Enter Dashboard</button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        position: "relative", zIndex: 10, display: "flex", justifyContent: "center", gap: 0,
        margin: "0 48px", opacity: visible ? 1 : 0, transition: "opacity 1s ease 0.3s",
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            flex: 1, maxWidth: 200, textAlign: "center", padding: "20px",
            background: "rgba(14,25,50,0.6)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.08)",
            borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
            borderRadius: i === 0 ? "12px 0 0 12px" : i === STATS.length - 1 ? "0 12px 12px 0" : 0,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>{s.num}</div>
            <div style={{ fontSize: 12, color: "#475569", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{
        position: "relative", zIndex: 10, padding: "80px 48px",
        background: "linear-gradient(180deg, transparent, rgba(3,7,26,0.95) 20%)",
      }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 12 }}>
          Everything a Modern Hospital Needs
        </h2>
        <p style={{ textAlign: "center", color: "#475569", marginBottom: 48, fontSize: 16 }}>
          Built on open standards, secured by cryptography.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${0.5 + i * 0.08}s, transform 0.6s ease ${0.5 + i * 0.08}s, box-shadow 0.2s, border-color 0.2s`,
            }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: "relative", zIndex: 10, textAlign: "center",
        padding: "60px 48px 80px", background: "rgba(3,7,26,0.95)",
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: 12 }}>
          Ready to Get Started?
        </h2>
        <p style={{ color: "#475569", fontSize: 16, marginBottom: 32 }}>
          Connect your wallet. Manage healthcare on-chain.
        </p>
        <button className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => navigate("/register")}>
          Enter the App
        </button>
        <div style={{ marginTop: 60, color: "#1e293b", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>
          Built with React · Node.js · MongoDB · Solidity · Ganache
        </div>
      </div>
    </div>
  );
};

export default Landing;
