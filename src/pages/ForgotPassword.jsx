import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  WorkspacePremiumRounded,
  Email,
  ArrowBack,
} from "@mui/icons-material";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendMessage =
          data.message ||
          (Array.isArray(data.errors) && data.errors[0]?.msg) ||
          "Something went wrong. Please try again.";
        throw new Error(backendMessage);
      }

      // Backend always returns the same generic success message,
      // regardless of whether the email actually exists — this is
      // intentional (prevents leaking which emails are registered)
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = (e) => {
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

        {!submitted ? (
          <>
            <h2 className="login-title">Forgot your password?</h2>
            <p className="login-subtitle">
              Enter your email and we'll send you a link to reset it.
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>

              <div className="login-field">
                <label>Email Address</label>
                <div className={`login-input-wrap ${fieldError ? "login-input-error" : ""}`}>
                  <Email className="login-input-icon" style={{ fontSize: 18 }} />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={handleEmailChange}
                    autoFocus
                  />
                </div>
                {fieldError && <div className="login-field-error">{fieldError}</div>}
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : "Send Reset Link"}
              </button>

            </form>
          </>
        ) : (
          <div className="login-success-box">
            <div className="login-success-icon">✓</div>
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Check your email</h2>
            <p className="login-subtitle" style={{ marginBottom: 0 }}>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. The link expires in 1 hour.
            </p>
          </div>
        )}

        <p className="login-footer-text">
          <a href="#" onClick={handleBackToLogin} className="login-back-link">
            <ArrowBack style={{ fontSize: 14 }} /> Back to Sign In
          </a>
        </p>

      </div>
    </div>
  );
}