import { createContext, useContext, useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking"); // "checking" | "authenticated" | "unauthenticated"

  const refreshAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, refreshAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}