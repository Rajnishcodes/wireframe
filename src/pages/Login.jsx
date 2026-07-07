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

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // Placeholder for real auth call — replace this block with your
      // actual API request once the backend is connected, e.g.:
      //
      // const res = await fetch("http://localhost:5000/api/auth/login", {
      //   method: "POST",
      //   credentials: "include", // required so the httpOnly cookie is sent/received
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || "Login failed");

      await new Promise((resolve) => setTimeout(resolve, 900));

      // Temporary stand-in for real auth state until backend is wired up
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      if (onLogin) onLogin({ email, remember });

      // This is the actual fix — redirect after a successful login
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Decorative floating blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo-icon">
            <WorkspacePremiumRounded />
          </div>
          <h1>Executive Hub</h1>
          <p>Premium Workspace</p>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to continue to your dashboard</p>

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <Email className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <Lock className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
              </button>
            </div>
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

            <a href="#" className="login-forgot">Forgot password?</a>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Sign In"}
          </button>

        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <div className="login-social-row">
          <button type="button" className="login-social-btn">
            <GoogleIcon /> Google
          </button>
          <button type="button" className="login-social-btn">
            <MicrosoftIcon /> Microsoft
          </button>
        </div>

        <p className="login-footer-text">
          Don't have an account? <a href="#">Contact your administrator</a>
        </p>

      </div>
    </div>
  );
}

/* Small inline brand icons so no extra icon-library dependency is needed */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 4.9 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 6.9 29.6 5 24 5c-7.6 0-14.2 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 43c5.5 0 10.4-1.9 14.1-5l-6.5-5.5c-2 1.5-4.6 2.5-7.6 2.5-5.3 0-9.7-3.4-11.3-8.1l-6.6 5C9.7 38.6 16.3 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C40.9 36.6 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
      <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}