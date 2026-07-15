import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  WorkspacePremiumRounded,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business,
  LocationOn,
  Notes,
  LockPersonRounded,
} from "@mui/icons-material";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Tracks whether the current visitor is actually authorized to be here.
  // "checking" | "authorized" | "unauthorized"
  const [authStatus, setAuthStatus] = useState("checking");

  // Verify on page load that the visitor is logged in AND has the
  // superadmin role — since /api/auth/register now requires both.
  // This avoids a confusing 401 only appearing after filling the whole form.
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setAuthStatus("unauthorized");
          return;
        }

        const data = await res.json();

        if (data.user?.role === "superadmin") {
          setAuthStatus("authorized");
        } else {
          setAuthStatus("unauthorized");
        }
      } catch {
        setAuthStatus("unauthorized");
      }
    };

    checkAccess();
  }, []);

  const validateFields = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
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
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          department: department.trim(),
          location: location.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendMessage =
          data.message ||
          (Array.isArray(data.errors) && data.errors[0]?.msg) ||
          "Registration failed. Please try again.";
        throw new Error(backendMessage);
      }

      if (onRegister) onRegister({ user: data.user });

      // Clear the form after successfully creating an account, rather than
      // navigating to /dashboard — the superadmin creating this account
      // should stay on this page, not get logged into the new user's session
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setDepartment("");
      setLocation("");
      setBio("");
      setError("");
      alert(`Account created successfully for ${data.user.name}.`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
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

  // ---- Gate the entire form behind the access check ----

  if (authStatus === "checking") {
    return (
      <div className="login-page">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
        <div className="login-card">
          <div className="login-success-box">
            <span className="login-spinner login-spinner-dark" />
            <p className="login-subtitle" style={{ marginTop: 12 }}>Checking access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthorized") {
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
            <LockPersonRounded style={{ fontSize: 40, color: "#DC2626" }} />
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Access Restricted</h2>
            <p className="login-subtitle">
              Creating an account requires a Super Admin session. Please sign in with a Super Admin account first.
            </p>
            <button className="login-submit-btn" style={{ marginTop: 16 }} onClick={handleGoToLogin}>
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">

      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card register-card">

        <div className="login-brand">
          <div className="login-logo-icon">
            <WorkspacePremiumRounded />
          </div>
          <h1>Executive Hub</h1>
          <p>Premium Workspace</p>
        </div>

        <h2 className="login-title">Create a new account</h2>
        <p className="login-subtitle">Add a new user to the workspace</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* --- Required fields --- */}

          <div className="login-field">
            <label>Full Name</label>
            <div className={`login-input-wrap ${fieldErrors.name ? "login-input-error" : ""}`}>
              <Person className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder="Rajnish Sri"
                value={name}
                onChange={handleNameChange}
                autoFocus
              />
            </div>
            {fieldErrors.name && <div className="login-field-error">{fieldErrors.name}</div>}
          </div>

          <div className="login-field">
            <label>Email Address</label>
            <div className={`login-input-wrap ${fieldErrors.email ? "login-input-error" : ""}`}>
              <Email className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            {fieldErrors.email && <div className="login-field-error">{fieldErrors.email}</div>}
          </div>

          <div className="register-grid-2">
            <div className="login-field">
              <label>Password</label>
              <div className={`login-input-wrap ${fieldErrors.password ? "login-input-error" : ""}`}>
                <Lock className="login-input-icon" style={{ fontSize: 18 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
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

            <div className="login-field">
              <label>Confirm Password</label>
              <div className={`login-input-wrap ${fieldErrors.confirmPassword ? "login-input-error" : ""}`}>
                <Lock className="login-input-icon" style={{ fontSize: 18 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
              </div>
              {fieldErrors.confirmPassword && <div className="login-field-error">{fieldErrors.confirmPassword}</div>}
            </div>
          </div>

          {/* --- Optional profile fields (match user.model.js) --- */}

          <div className="register-divider">
            <span>Profile details (optional)</span>
          </div>

          <div className="register-grid-2">
            <div className="login-field">
              <label>Phone Number</label>
              <div className="login-input-wrap">
                <Phone className="login-input-icon" style={{ fontSize: 18 }} />
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label>Department</label>
              <div className="login-input-wrap">
                <Business className="login-input-icon" style={{ fontSize: 18 }} />
                <input
                  type="text"
                  placeholder="Executive Leadership"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="login-field">
            <label>Location</label>
            <div className="login-input-wrap">
              <LocationOn className="login-input-icon" style={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field">
            <label>Bio</label>
            <div className="login-input-wrap login-textarea-wrap">
              <Notes className="login-input-icon" style={{ fontSize: 18, alignSelf: "flex-start", marginTop: 2 }} />
              <textarea
                placeholder="A short description about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Create Account"}
          </button>

        </form>

      </div>
    </div>
  );
}