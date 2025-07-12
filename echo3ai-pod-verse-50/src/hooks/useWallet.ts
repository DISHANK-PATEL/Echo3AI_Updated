import { useState, useEffect } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  // Sepolia network configuration
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
  const SEPOLIA_NETWORK = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Helper: Authenticate with backend using MetaMask
  const authenticateWithBackend = async (address: string) => {
    try {
      // Get nonce from backend
      const nonceResponse = await fetch('https://echo3ai-updated-3.onrender.com/auth/nonce', {
        method: 'GET',
        credentials: 'include'
      });
      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication nonce');
      }
      const nonceData = await nonceResponse.json();
      const message = nonceData.message;
      // Sign the message with MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      // Send signature to backend for authentication
      const authResponse = await fetch('https://echo3ai-updated-3.onrender.com/auth/metamask/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          address: address,
          signature: signature,
          message: message,
          chainId: SEPOLIA_CHAIN_ID
        })
      });
      if (!authResponse.ok) {
        const authError = await authResponse.json();
        throw new Error(authError.error || 'Authentication failed');
      }
      return true;
    } catch (authError: any) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask backend authentication failed: ' + (authError.message || 'Unknown error'),
      }));
      return false;
    }
  };

  // Connect to MetaMask (with backend authentication)
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) throw new Error('No accounts found');
      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // Check if we're on Sepolia
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SEPOLIA_NETWORK],
            });
          } else {
            throw switchError;
          }
        }
      }
      // Always authenticate with backend
      const backendAuthSuccess = await authenticateWithBackend(address);
      if (!backendAuthSuccess) throw new Error('MetaMask backend authentication failed');
      setWalletState({
        isConnected: true,
        address,
        chainId: SEPOLIA_CHAIN_ID,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await fetch('https://echo3ai-updated-3.onrender.com/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to logout from backend:', error);
    }
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  };

  // Listen for account and chain changes, auto re-authenticate if needed
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // On account change, always re-authenticate with backend
        setWalletState(prev => ({ ...prev, address: accounts[0] }));
        await authenticateWithBackend(accounts[0]);
      }
    };
    const handleChainChanged = async (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setWalletState(prev => ({ ...prev, error: 'Please switch to Sepolia testnet' }));
      } else {
        setWalletState(prev => ({ ...prev, chainId, error: null }));
        // On chain change, re-authenticate with backend
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await authenticateWithBackend(accounts[0]);
        }
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // On page load, check connection and backend session, auto re-authenticate if needed
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (accounts.length > 0) {
          // Check backend session
          const authStatusResponse = await fetch('https://echo3ai-updated-3.onrender.com/auth/status', {
            method: 'GET',
            credentials: 'include'
          });
          const authStatus = await authStatusResponse.json();
          if (!authStatus.success || !authStatus.isAuthenticated || authStatus.accountId?.toLowerCase() !== accounts[0].toLowerCase()) {
            // Backend session expired or mismatched, re-authenticate
            await authenticateWithBackend(accounts[0]);
          }
          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId,
            isConnecting: false,
            error: chainId !== SEPOLIA_CHAIN_ID ? 'Please switch to Sepolia testnet' : null,
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    checkConnection();
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
  };
}; 