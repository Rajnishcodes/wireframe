import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  WorkspacePremiumRounded,
  Lock,
  Visibility,
  VisibilityOff,
  ErrorOutlineRounded,
} from "@mui/icons-material";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("This reset link is missing a token. Please request a new one.");
    }
  }, [token]);

  const validateFields = () => {
    const errors = {};

    if (!newPassword.trim()) {
      errors.newPassword = "Password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return;
    if (!validateFields()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendMessage =
          data.message ||
          (Array.isArray(data.errors) && data.errors[0]?.msg) ||
          "Something went wrong. Please try again.";
        throw new Error(backendMessage);
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const handleTogglePassword = () => {
    setShowPassword((v) => !v);
  };

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

        {success ? (
          <div className="login-success-box">
            <div className="login-success-icon">✓</div>
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Password reset!</h2>
            <p className="login-subtitle">Redirecting you to sign in...</p>
          </div>
        ) : !token ? (
          <div className="login-success-box">
            <ErrorOutlineRounded style={{ fontSize: 40, color: "#DC2626" }} />
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Invalid Link</h2>
            <p className="login-subtitle">
              This password reset link is missing or malformed. Please request a new one.
            </p>
            <button
              className="login-submit-btn"
              style={{ marginTop: 16 }}
              onClick={() => navigate("/forgot-password")}
            >
              Request New Link
            </button>
          </div>
        ) : (
          <>
            <h2 className="login-title">Reset your password</h2>
            <p className="login-subtitle">Choose a new password for your account.</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>

              <div className="login-field">
                <label>New Password</label>
                <div className={`login-input-wrap ${fieldErrors.newPassword ? "login-input-error" : ""}`}>
                  <Lock className="login-input-icon" style={{ fontSize: 18 }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={handleTogglePassword}
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                  </button>
                </div>
                {fieldErrors.newPassword && <div className="login-field-error">{fieldErrors.newPassword}</div>}
              </div>

              <div className="login-field">
                <label>Confirm New Password</label>
                <div className={`login-input-wrap ${fieldErrors.confirmPassword ? "login-input-error" : ""}`}>
                  <Lock className="login-input-icon" style={{ fontSize: 18 }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                </div>
                {fieldErrors.confirmPassword && <div className="login-field-error">{fieldErrors.confirmPassword}</div>}
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : "Reset Password"}
              </button>

            </form>

            <p className="login-footer-text">
              <a href="#" onClick={handleGoToLogin}>Back to Sign In</a>
            </p>
          </>
        )}

      </div>
    </div>
  );
}