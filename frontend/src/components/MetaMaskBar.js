import { useState, useEffect } from "react";
import { connectMetaMask, getMetaMaskAccount, formatAddress, isMetaMaskInstalled, switchToGanache } from "../utils/metamask";
import { linkWallet } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const MetaMaskBar = () => {
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [linking, setLinking] = useState(false);
  const { user, loginUser, token } = useAuth();

  useEffect(() => {
    getMetaMaskAccount().then(setAccount);
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => setAccount(accounts[0] || null));
    }
  }, []);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask not installed! Please install the MetaMask browser extension.");
      return;
    }
    setConnecting(true);
    try {
      await switchToGanache();
      const acc = await connectMetaMask();
      setAccount(acc);
      toast.success("MetaMask connected!");
    } catch (err) {
      toast.error(err.message || "Failed to connect MetaMask");
    }
    setConnecting(false);
  };

  const handleLinkWallet = async () => {
    if (!account) return;
    setLinking(true);
    try {
      await linkWallet({ walletAddress: account });
      // Update user in context with walletAddress
      loginUser({ ...user, walletAddress: account.toLowerCase() }, token);
      toast.success("Wallet linked! You can now sign in with MetaMask next time.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link wallet");
    }
    setLinking(false);
  };

  const walletLinked = user?.walletAddress;

  return (
    <div className="metamask-bar">
      <span style={{ fontSize: 20 }}>🦊</span>
      <div className={`metamask-dot ${account ? "connected" : "disconnected"}`} />
      {account ? (
        <>
          <span style={{ fontWeight: 600, color: "var(--nhs-green)" }}>Connected:</span>
          <code style={{ fontSize: 13 }}>{formatAddress(account)}</code>
          {!walletLinked ? (
            <button
              className="btn btn-metamask btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={handleLinkWallet}
              disabled={linking}
            >
              {linking ? "Linking..." : "Link to Account"}
            </button>
          ) : (
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--nhs-green)", fontWeight: 600 }}>Wallet Linked</span>
          )}
        </>
      ) : (
        <>
          <span style={{ color: "var(--nhs-dark-grey)" }}>MetaMask not connected</span>
          <button
            className="btn btn-metamask btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </>
      )}
    </div>
  );
};

export default MetaMaskBar;