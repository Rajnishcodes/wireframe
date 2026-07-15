import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  WorkspacePremiumRounded,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateFields = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendMessage =
          data.message ||
          (Array.isArray(data.errors) && data.errors[0]?.msg) ||
          "Login failed. Please try again.";
        throw new Error(backendMessage);
      }

      if (onLogin) onLogin({ user: data.user, remember });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((v) => !v);
  };

  const handleGoToForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
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

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to continue to your dashboard</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          <div className="login-field">
            <label>Email Address</label>
            <div className={`login-input-wrap ${fieldErrors.email ? "login-input-error" : ""}`}>
              <Email className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={handleEmailChange}
                autoFocus
              />
            </div>
            {fieldErrors.email && <div className="login-field-error">{fieldErrors.email}</div>}
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className={`login-input-wrap ${fieldErrors.password ? "login-input-error" : ""}`}>
              <Lock className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
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
            {fieldErrors.password && <div className="login-field-error">{fieldErrors.password}</div>}
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-row-between">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <a href="#" className="login-forgot" onClick={handleGoToForgotPassword}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
}