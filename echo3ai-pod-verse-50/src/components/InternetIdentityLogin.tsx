import React, { useEffect, useState } from "react";
// import { AuthClient } from "@dfinity/auth-client";

interface Props {
  onAuthChange?: (isAuthenticated: boolean, principal?: string) => void;
  size?: number;
}

const InternetIdentityLogin: React.FC<Props> = ({ onAuthChange, size = 40 }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from backend
    checkAuthStatus();
  }, [onAuthChange]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/auth/status", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.walletType === 'icp') {
          setIsAuthenticated(true);
          setPrincipal(data.accountId);
          if (onAuthChange) onAuthChange(true, data.accountId);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // For now, we'll use a simple prompt for the principal
      // In a real implementation, you'd integrate with Internet Identity
      const principalText = prompt("Enter your Internet Identity Principal:");
      
      if (principalText) {
        // Send principal to backend
        const response = await fetch("/auth/icp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ principal: principalText }),
        });

        if (response.ok) {
          setIsAuthenticated(true);
          setPrincipal(principalText);
          if (onAuthChange) onAuthChange(true, principalText);
        } else {
          alert("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setPrincipal(null);
        if (onAuthChange) onAuthChange(false);
      }
    } catch (error) {
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