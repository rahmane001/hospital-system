import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero */}
      <div className="landing-hero">
        <div className="hero-text">
          <h1>Modern Hospital Management on the Blockchain</h1>
          <p>
            A fully decentralised hospital management system combining secure patient records,
            smart contract billing, and real-time appointment management — powered by Ethereum and MongoDB.
          </p>
          <div className="hero-btns">
            <button className="btn btn-primary" style={{ fontSize: 17, padding: "14px 32px" }} onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn btn-outline" style={{ fontSize: 17, padding: "14px 32px", background: "transparent", borderColor: "white", color: "white" }} onClick={() => navigate("/register")}>
              Register
            </button>
          </div>
        </div>
        <div style={{ fontSize: 120, opacity: 0.2 }}>🏥</div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: "var(--nhs-blue)", padding: "24px 48px", display: "flex", justifyContent: "center", gap: "64px" }}>
        {[
          { num: "100%", label: "Blockchain Secured" },
          { num: "4", label: "User Roles" },
          { num: "Real-time", label: "Notifications" },
          { num: "MetaMask", label: "Payments" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Fraunces, serif" }}>{s.num}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="features-section">
        <h2>Everything a Modern Hospital Needs</h2>
        <div className="features-grid">
          {[
            { icon: "🔐", title: "Secure Authentication", desc: "Role-based access control for Admins, Doctors, Patients, and Receptionists with JWT tokens." },
            { icon: "⛓️", title: "Blockchain Records", desc: "Patient records, appointments, and billing transactions are immutably logged on the Ethereum blockchain via Ganache." },
            { icon: "🦊", title: "MetaMask Payments", desc: "Patients can pay bills directly using MetaMask with real ETH transactions on the local Ganache network." },
            { icon: "💊", title: "Prescriptions", desc: "Doctors issue digital prescriptions with medicine details, dosage, and diagnosis — hashed and stored on-chain." },
            { icon: "🛏️", title: "Bed Management", desc: "Real-time bed availability tracking across departments. Assign and release beds with one click." },
            { icon: "📊", title: "Analytics Dashboard", desc: "Comprehensive charts and statistics for admins to monitor hospital performance and patient flows." },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "var(--nhs-dark-blue)", padding: "64px 48px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: 36, marginBottom: 16 }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32 }}>Create an account as a patient or doctor and experience the future of healthcare management.</p>
        <button className="btn btn-primary" style={{ fontSize: 18, padding: "16px 40px", background: "var(--nhs-light-blue)" }} onClick={() => navigate("/register")}>
          Create Account
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: "#111", padding: "24px 48px", color: "rgba(255,255,255,0.5)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>🏥 HMS DApp — Hospital Management System</span>
        <span>Built with React · Node.js · MongoDB · Solidity · Ganache</span>
      </div>
    </div>
  );
};

export default Landing;