import { useState, useEffect } from "react";
import MetaMaskBar from "../../components/MetaMaskBar";
import { getBlockchainStats, verifyPrescription, verifyBilling } from "../../utils/blockchain";

const BlockchainPage = ({ prescriptions, bills }) => {
  const [chainStats, setChainStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [verifying, setVerifying] = useState(false);

  const loadChainData = async () => {
    const stats = await getBlockchainStats();
    setChainStats(stats);
  };

  const runVerification = async () => {
    setVerifying(true);
    const results = [];

    // Verify prescriptions
    for (const p of prescriptions.filter(rx => rx.blockchainTxHash)) {
      const onChain = await verifyPrescription(p._id);
      results.push({
        id: p._id,
        type: "Prescription",
        label: `Rx for ${p.patient?.name || "patient"}`,
        txHash: p.blockchainTxHash,
        verified: onChain.exists,
        date: p.createdAt,
      });
    }

    // Verify bills
    for (const b of bills.filter(b => b.status === "paid").slice(0, 10)) {
      const onChain = await verifyBilling(b._id);
      results.push({
        id: b._id,
        type: "Bill",
        label: `\u00a3${b.amount} payment`,
        txHash: b.blockchainTxHash || "N/A",
        verified: onChain.exists,
        date: b.updatedAt,
      });
    }

    setVerifications(results);
    setVerifying(false);
  };

  useEffect(() => { loadChainData(); }, []);

  const contractAddr = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0ab4454A3D41B3c5567A10CC958f0f87d55f4EbD";

  return (
    <div>
      <div className="page-header">
        <h1>Blockchain Verification</h1>
        <p>Real-time smart contract verification on Ganache</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <MetaMaskBar />

        {/* Contract Info Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)", fontWeight: 600 }}>CONTRACT ADDRESS</div>
              <code style={{ fontSize: 13 }}>{contractAddr}</code>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)", fontWeight: 600 }}>NETWORK</div>
              <span>Ganache (Chain ID: 5777)</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--nhs-dark-grey)", fontWeight: 600 }}>CONTRACT</div>
              <span>HospitalRecords v2</span>
            </div>
          </div>
        </div>

        {/* On-Chain Stats */}
        <h3 style={{ marginBottom: 12 }}>On-Chain Record Counts</h3>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><span className="stat-icon">&#128100;</span><div className="stat-info"><h3>{chainStats?.patients ?? "..."}</h3><p>Patient Records</p></div></div>
          <div className="stat-card" style={{ borderLeftColor: "var(--nhs-green)" }}><span className="stat-icon">&#128197;</span><div className="stat-info"><h3>{chainStats?.appointments ?? "..."}</h3><p>Appointments</p></div></div>
          <div className="stat-card" style={{ borderLeftColor: "var(--nhs-yellow)" }}><span className="stat-icon">&#128179;</span><div className="stat-info"><h3>{chainStats?.bills ?? "..."}</h3><p>Bills</p></div></div>
          <div className="stat-card" style={{ borderLeftColor: "var(--nhs-red)" }}><span className="stat-icon">&#128138;</span><div className="stat-info"><h3>{chainStats?.prescriptions ?? "..."}</h3><p>Prescriptions</p></div></div>
        </div>

        {/* Verification Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Record Verification</h3>
          <button className="btn btn-primary" onClick={runVerification} disabled={verifying}>
            {verifying ? "Verifying..." : "Run Verification"}
          </button>
        </div>

        {verifications.length > 0 && (
          <div className="table-container">
            <table>
              <thead><tr><th>Type</th><th>Record</th><th>Date</th><th>Tx Hash</th><th>On-Chain Status</th></tr></thead>
              <tbody>
                {verifications.map(v => (
                  <tr key={v.id}>
                    <td><span className="badge badge-blue">{v.type}</span></td>
                    <td>{v.label}</td>
                    <td style={{ fontSize: 13 }}>{new Date(v.date).toLocaleDateString()}</td>
                    <td><code style={{ fontSize: 11 }}>{v.txHash ? `${v.txHash.slice(0, 10)}...${v.txHash.slice(-8)}` : "N/A"}</code></td>
                    <td>{v.verified ? <span className="badge badge-green">Verified</span> : <span className="badge badge-red">Not Found</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {verifications.length === 0 && !verifying && (
          <div className="alert alert-info">Click "Run Verification" to check records against the smart contract on Ganache.</div>
        )}
      </div>
    </div>
  );
};

export default BlockchainPage;
