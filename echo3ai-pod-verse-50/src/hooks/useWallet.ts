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

  // Connect to MetaMask
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
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Check if we're on Sepolia
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
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

      // Authenticate with backend
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
        
        console.log('Successfully authenticated with backend');
        
      } catch (authError: any) {
        console.error('Backend authentication failed:', authError);
        // Continue with frontend connection even if backend auth fails
        // The user can still use the app, but tipping will require re-authentication
      }

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
    // Clear backend session
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

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // User switched accounts
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setWalletState(prev => ({
          ...prev,
          error: 'Please switch to Sepolia testnet',
        }));
      } else {
        setWalletState(prev => ({
          ...prev,
          chainId,
          error: null,
        }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Check initial connection state
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (accounts.length > 0) {
          // Check if backend session is still valid
          try {
            const authStatusResponse = await fetch('https://echo3ai-updated-3.onrender.com/auth/status', {
              method: 'GET',
              credentials: 'include'
            });
            
            const authStatus = await authStatusResponse.json();
            
            if (!authStatus.success || !authStatus.isAuthenticated) {
              // Backend session expired, need to re-authenticate
              console.log('Backend session expired, wallet connected but not authenticated');
            }
          } catch (error) {
            console.error('Failed to check backend authentication status:', error);
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