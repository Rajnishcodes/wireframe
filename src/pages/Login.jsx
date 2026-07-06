import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowForward,
  ArrowBack,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Bolt,
  Insights,
  Shield,
} from "@mui/icons-material";

import "../styles/Login.css";

const FEATURE_TICKER = [
  { Icon: Bolt,     text: "Real-time meeting sync" },
  { Icon: Insights, text: "Smart task prioritization" },
  { Icon: Shield,   text: "Enterprise-grade encryption" },
];

export default function LoginDark() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const passwordRef = useRef(null);

  // rotate the feature ticker on the left panel
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % FEATURE_TICKER.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  // autofocus the password field the instant we step into it
  useEffect(() => {
    if (step === "password") {
      const t = setTimeout(() => passwordRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  const emailValid = /\S+@\S+\.\S+/.test(email);

  const handleContinue = (e) => {
    e.preventDefault();
    if (!emailValid) return;
    setStep("password");
  };

  const handleBack = () => {
    setStep("email");
    setPassword("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1400);
  };

  return (
    <div className="ld-page">
      {/* ============ LEFT — animated mesh / brand ============ */}
      <div className="ld-left">
        <div className="ld-mesh">
          <div className="ld-blob ld-blob-1" />
          <div className="ld-blob ld-blob-2" />
          <div className="ld-blob ld-blob-3" />
          <div className="ld-grid-overlay" />
        </div>

        <div className="ld-left-content">
          <div className="ld-brand">
            <div className="ld-brand-mark">EH</div>
            <span className="ld-brand-name">Executive Hub</span>
          </div>

          <div className="ld-hero">
            <h1 className="ld-hero-title">
              Command your day<br />with total clarity.
            </h1>
            <p className="ld-hero-sub">
              One workspace for meetings, tasks, notes, and everything
              that keeps the business moving.
            </p>
          </div>

          {/* rotating feature ticker */}
          <div className="ld-ticker">
            <AnimatePresence mode="wait">
              {FEATURE_TICKER.map((f, i) =>
                i === tickerIndex ? (
                  <motion.div
                    key={f.text}
                    className="ld-ticker-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <f.Icon style={{ fontSize: 18 }} />
                    <span>{f.text}</span>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
            <div className="ld-ticker-dots">
              {FEATURE_TICKER.map((_, i) => (
                <span key={i} className={`ld-dot ${i === tickerIndex ? "ld-dot-active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ RIGHT — auth card ============ */}
      <div className="ld-right">
        <div className="ld-card">
          {/* mobile-only brand mark */}
          <div className="ld-card-brand-mobile">
            <div className="ld-brand-mark">EH</div>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <p className="ld-step-label">Step 1 of 2</p>
                <h2 className="ld-card-title">Welcome back</h2>
                <p className="ld-card-sub">Enter your work email to continue.</p>

                <form onSubmit={handleContinue} className="ld-form">
                  <div className="ld-field">
                    <label className="ld-label">Email address</label>
                    <input
                      type="email"
                      autoFocus
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ld-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!emailValid}
                    className="ld-btn-primary"
                  >
                    Continue <ArrowForward style={{ fontSize: 18 }} />
                  </button>
                </form>

                <div className="ld-divider"><span>or</span></div>

                <button className="ld-btn-sso">
                  <span className="ld-sso-dot" />
                  Continue with Single Sign-On
                </button>

                <p className="ld-footer-text">
                  New to Executive Hub? <a href="#">Request access</a>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <button className="ld-back-btn" onClick={handleBack} type="button">
                  <ArrowBack style={{ fontSize: 16 }} /> Back
                </button>

                <p className="ld-step-label">Step 2 of 2</p>
                <h2 className="ld-card-title">Enter your password</h2>

                <div className="ld-identity-chip">
                  <CheckCircle style={{ fontSize: 16, color: "#34D399" }} />
                  <span>{email}</span>
                </div>

                <form onSubmit={handleLogin} className="ld-form">
                  <div className="ld-field">
                    <label className="ld-label">Password</label>
                    <div className="ld-password-wrap">
                      <Lock className="ld-password-icon" style={{ fontSize: 18 }} />
                      <input
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ld-input ld-input-password"
                      />
                      <button
                        type="button"
                        className="ld-eye-btn"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                      </button>
                    </div>
                  </div>

                  <div className="ld-row-between">
                    <label className="ld-checkbox-label">
                      <input type="checkbox" className="ld-checkbox" />
                      Stay signed in
                    </label>
                    <a href="#" className="ld-link-small">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={!password || loading}
                    className="ld-btn-primary"
                  >
                    {loading ? (
                      <span className="ld-spinner" />
                    ) : (
                      <>Sign in <ArrowForward style={{ fontSize: 18 }} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="ld-legal">© 2026 Executive Hub. All rights reserved.</p>
      </div>
    </div>
  );
}