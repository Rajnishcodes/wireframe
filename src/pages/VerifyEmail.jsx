import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  WorkspacePremiumRounded,
  CheckCircle,
  ErrorOutlineRounded,
} from "@mui/icons-material";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    // Guards against React StrictMode's double-invoke in development,
    // which would otherwise fire this verification request twice
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing a token.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Verification failed.");
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "This verification link is invalid or has expired.");
      }
    };

    verify();
  }, [token]);

  const handleGoToLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="login-page">

      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">

        <div className="login-brand">
          <div className="login-logo-icon">
            <WorkspacePremiumRounded />
          </div>
          <h1>Executive Hub</h1>
          <p>Premium Workspace</p>
        </div>

        <div className="login-success-box">
          {status === "verifying" && (
            <>
              <span className="login-spinner login-spinner-dark" />
              <h2 className="login-title" style={{ fontSize: "1.25rem", marginTop: 12 }}>
                Verifying your email...
              </h2>
              <p className="login-subtitle">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle style={{ fontSize: 40, color: "#059669" }} />
              <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Email Verified!</h2>
              <p className="login-subtitle">{message}</p>
              <button className="login-submit-btn" style={{ marginTop: 16 }} onClick={handleGoToLogin}>
                Continue to Sign In
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <ErrorOutlineRounded style={{ fontSize: 40, color: "#DC2626" }} />
              <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Verification Failed</h2>
              <p className="login-subtitle">{message}</p>
              <button className="login-submit-btn" style={{ marginTop: 16 }} onClick={handleGoToLogin}>
                Back to Sign In
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}