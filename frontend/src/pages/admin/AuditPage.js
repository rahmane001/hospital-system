import { useState, useEffect } from "react";
import { getAuditLogs } from "../../utils/api";

const AuditPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState("");
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    const loadAudit = async () => {
      setAuditLoading(true);
      try {
        const params = {};
        if (auditFilter) params.action = auditFilter;
        const res = await getAuditLogs(params);
        setAuditLogs(res.data.logs || []);
      } catch { setAuditLogs([]); }
      setAuditLoading(false);
    };
    loadAudit();
  }, [auditFilter]);

  const actionBadge = (action) => {
    const colors = { login: "badge-blue", wallet_login: "badge-blue", register: "badge-green", create: "badge-green", pay: "badge-green", update: "badge-orange", delete: "badge-red", link_wallet: "badge-blue", approve: "badge-green" };
    return colors[action] || "badge-grey";
  };

  return (
    <div>
      <div className="page-header">
        <h1>Audit Log</h1>
        <p>Security and compliance activity trail</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          {["", "login", "wallet_login", "register", "create", "pay", "link_wallet", "approve"].map(f => (
            <button key={f} className={`btn btn-sm ${auditFilter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setAuditFilter(f)}>
              {f || "All"}
            </button>
          ))}
        </div>
        <div className="table-container">
          {auditLoading ? <div className="loading-container"><div className="spinner" /></div> : (
            <table>
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Details</th><th>IP</th></tr></thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.user?.name || "System"}<br /><span style={{ fontSize: 11, color: "var(--nhs-dark-grey)" }}>{log.user?.role}</span></td>
                    <td><span className={`badge ${actionBadge(log.action)}`}>{log.action}</span></td>
                    <td>{log.resource}</td>
                    <td style={{ fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{log.details}</td>
                    <td style={{ fontSize: 12, fontFamily: "monospace" }}>{log.ipAddress}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">&#128203;</div><h3>No audit logs yet</h3></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPage;
