// MetaMask / Web3 utilities

export const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed. Please install MetaMask to use blockchain features.");
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  };
  
  export const getMetaMaskAccount = async () => {
    if (!window.ethereum) return null;
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts[0] || null;
  };
  
  export const isMetaMaskInstalled = () => !!window.ethereum;
  
  export const switchToGanache = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x539" }], // 1337 in hex (Ganache)
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x539",
            chainName: "Ganache Local",
            rpcUrls: ["http://127.0.0.1:7545"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          }],
        });
      }
    }
  };
  
  export const payWithMetaMask = async (toAddress, amountEth, billId) => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const from = accounts[0];
    const amountWei = (BigInt(Math.round(amountEth * 1e18))).toString(16);
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from,
        to: toAddress,
        value: "0x" + amountWei,
        gas: "0x5208",
      }],
    });
    return txHash;
  };
  
  export const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  export const ethToWei = (eth) => BigInt(Math.round(eth * 1e18));
  export const weiToEth = (wei) => Number(wei) / 1e18;