import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockPersonRounded } from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Wraps a page and only renders it if the logged-in user's role is
 * included in `allowedRoles`. Otherwise shows an "Access Restricted"
 * message instead of the page content — used for Admin-blocked pages
 * where the Sidebar link should still be visible/clickable.
 *
 * Usage: <RoleRoute allowedRoles={["superadmin", "user"]}><SettingsPage /></RoleRoute>
 */
export default function RoleRoute({ allowedRoles, children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setStatus("denied");
          return;
        }

        const data = await res.json();

        if (allowedRoles.includes(data.user?.role)) {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      } catch {
        setStatus("denied");
      }
    };

    checkRole();
  }, [allowedRoles]);

  if (status === "checking") {
    return (
      <div style={pageStyle}>
        Checking access...
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <LockPersonRounded style={{ fontSize: 48, color: "#DC2626" }} />
          <h2 style={titleStyle}>Access Restricted</h2>
          <p style={subtitleStyle}>
            You don't have permission to view this page. Contact your Super Admin if you believe this is a mistake.
          </p>
          <button style={btnStyle} onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#F7F5FD",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  padding: 20,
};

const cardStyle = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.9)",
  borderRadius: 24,
  padding: "40px 36px",
  maxWidth: 380,
  width: "100%",
  textAlign: "center",
  boxShadow: "0 30px 70px rgba(124,58,237,0.15)",
};

const titleStyle = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "#1E1B2E",
  margin: "12px 0 6px",
};

const subtitleStyle = {
  fontSize: "0.875rem",
  color: "#6B6580",
  margin: "0 0 20px",
  lineHeight: 1.5,
};

const btnStyle = {
  width: "100%",
  padding: 13,
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.9375rem",
  cursor: "pointer",
};