import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "authenticated" | "unauthenticated"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        setStatus(res.ok ? "authenticated" : "unauthenticated");
      } catch {
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  if (status === "checking") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F5FD",
        color: "#6B6580",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        Checking your session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}