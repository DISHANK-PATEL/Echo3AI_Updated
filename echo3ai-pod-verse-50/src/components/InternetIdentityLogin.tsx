import React, { useEffect, useState, createContext, useContext } from "react";
import type { AuthClient as AuthClientType } from "@dfinity/auth-client";
import { AuthClient } from "@dfinity/auth-client";

interface InternetIdentityAuthContextType {
  isAuthenticated: boolean;
  principal: string | null;
  setAuth: (auth: { isAuthenticated: boolean; principal: string | null }) => void;
}

const InternetIdentityAuthContext = createContext<InternetIdentityAuthContextType | undefined>(undefined);

export const useInternetIdentityAuth = () => {
  const ctx = useContext(InternetIdentityAuthContext);
  if (!ctx) throw new Error("useInternetIdentityAuth must be used within InternetIdentityAuthProvider");
  return ctx;
};

export const InternetIdentityAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  const setAuth = ({ isAuthenticated, principal }: { isAuthenticated: boolean; principal: string | null }) => {
    setIsAuthenticated(isAuthenticated);
    setPrincipal(principal);
  };

  return (
    <InternetIdentityAuthContext.Provider value={{ isAuthenticated, principal, setAuth }}>
      {children}
    </InternetIdentityAuthContext.Provider>
  );
};

interface Props {
  onAuthChange?: (isAuthenticated: boolean, principal?: string) => void;
  size?: number;
}

const InternetIdentityLogin: React.FC<Props> = ({ onAuthChange, size = 40 }) => {
  const [loading, setLoading] = useState(true);
  const [authClient, setAuthClient] = useState<AuthClientType | null>(null);
  const { isAuthenticated, principal, setAuth } = useInternetIdentityAuth();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line
  }, []);

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal().toText();
        setAuth({ isAuthenticated: true, principal });
        if (onAuthChange) onAuthChange(true, principal);
      } else {
        setAuth({ isAuthenticated: false, principal: null });
      }
    } catch (error) {
      setAuth({ isAuthenticated: false, principal: null });
      console.error("Error initializing auth client:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      console.error("Auth client not initialized");
      return;
    }
    try {
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          // identityProvider: process.env.NODE_ENV = 'https://identity.ic0.app',
            identityProvider: process.env.NODE_ENV === 'production' 
            ? 'https://identity.ic0.app' 
            : 'https://identity.ic0.app', 
            // : 'http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',

            onSuccess: () => {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toText();
            setAuth({ isAuthenticated: true, principal });
            if (onAuthChange) onAuthChange(true, principal);
            resolve();
          },
          onError: (error) => {
            console.error("Login error:", error);
            reject(error);
          },
        });
      });
    } catch (error) {
      setAuth({ isAuthenticated: false, principal: null });
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    if (!authClient) {
      console.error("Auth client not initialized");
      return;
    }
    try {
      await authClient.logout();
      setAuth({ isAuthenticated: false, principal: null });
      if (onAuthChange) onAuthChange(false);
    } catch (error) {
      setAuth({ isAuthenticated: false, principal: null });
      console.error("Logout error:", error);
    }
  };

  if (loading) return <button disabled>Loading...</button>;

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="relative group flex items-center">
            <img src="/ICP.png" alt="ICP Logo" style={{ width: size, height: size }} />
            <span className="text-green-400 font-semibold ml-2 group-hover:underline cursor-pointer">
              Logged in via Internet Identity
            </span>
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 mt-12 bg-gray-900 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg border border-gray-700" style={{minWidth: '200px'}}>
              Internet Identity Linked:<br />
              <span className="break-all text-teal-300">{principal}</span>
            </div>
          </div>
          <button onClick={logout} className="px-3 py-1 bg-gray-800 text-white rounded ml-2">Logout</button>
        </div>
      ) : (
        <button
          onClick={login}
          className="flex items-center space-x-2 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg hover:from-blue-700 hover:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <img src="/ICP.png" alt="ICP Logo" style={{ width: size, height: size }} />
          <span>Login with Internet Identity</span>
        </button>
      )}
    </div>
  );
};

export default InternetIdentityLogin; 