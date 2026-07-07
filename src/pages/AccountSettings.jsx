import { useState } from "react";
import {
  ManageAccountsRounded,
  Language,
  Devices,
  Logout,
  DeleteForever,
  Download,
  Shield,
  Email,
  Sms,
  CreditCard,
  CheckCircle,
  Laptop,
  PhoneIphone,
} from "@mui/icons-material";

import "../styles/Dashboard.css";
import "../styles/AccountSettings.css";

const sessions = [
  { id: 1, device: "MacBook Pro", location: "San Francisco, CA", lastActive: "Active now", current: true, Icon: Laptop },
  { id: 2, device: "iPhone 15", location: "San Francisco, CA", lastActive: "2 hours ago", current: false, Icon: PhoneIphone },
  { id: 3, device: "Windows PC", location: "New York, NY", lastActive: "3 days ago", current: false, Icon: Laptop },
];

const billingHistory = [
  { id: 1, plan: "Executive Plan — Annual", date: "Jan 15, 2026", amount: "$499.00", status: "Paid" },
  { id: 2, plan: "Executive Plan — Annual", date: "Jan 15, 2025", amount: "$449.00", status: "Paid" },
];

export default function AccountSettings() {
  const [activeSessions, setActiveSessions] = useState(sessions);
  const [emailVerified] = useState(true);
  const [phoneVerified] = useState(false);
  const [dataExportRequested, setDataExportRequested] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  };

  const revokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session signed out");
  };

  const requestDataExport = () => {
    setDataExportRequested(true);
    showToast("Data export requested — check your email in 24 hours");
  };

  return (
    <div className="lavender-page">
      {/* Header */}
      <div className="meet-header mb-6">
        <div className="acct-header-left">
          <div className="meet-header-icon">
            <ManageAccountsRounded className="icon-violet" style={{ fontSize: 26 }} />
          </div>
          <div>
            <h1 className="greeting-title" style={{ fontSize: "1.5rem" }}>Account Settings</h1>
            <p className="muted text-sm mt-1">Manage your account, billing, and active sessions</p>
          </div>
        </div>
      </div>

      <div className="acct-grid">

        {/* Account verification */}
        <section className="glass-card p-6 card-flex">
          <h2 className="section-title mb-4">Account Verification</h2>

          <div className="acct-verify-row">
            <div className="acct-verify-icon">
              <Email className="icon-violet" style={{ fontSize: 20 }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="acct-verify-title">Email Address</div>
              <div className="muted text-xs">john.doe@executivehub.com</div>
            </div>
            {emailVerified ? (
              <span className="acct-verified-chip">
                <CheckCircle style={{ fontSize: 14 }} /> Verified
              </span>
            ) : (
              <button className="btn-secondary" style={{ padding: "6px 14px" }}>Verify</button>
            )}
          </div>

          <div className="acct-verify-row">
            <div className="acct-verify-icon">
              <Sms className="icon-amber" style={{ fontSize: 20 }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="acct-verify-title">Phone Number</div>
              <div className="muted text-xs">+1 (555) 123-4567</div>
            </div>
            {phoneVerified ? (
              <span className="acct-verified-chip">
                <CheckCircle style={{ fontSize: 14 }} /> Verified
              </span>
            ) : (
              <button className="btn-secondary" style={{ padding: "6px 14px" }} onClick={() => showToast("Verification code sent")}>
                Verify
              </button>
            )}
          </div>
        </section>

        {/* Active sessions */}
        <section className="glass-card p-6 card-flex">
          <h2 className="section-title mb-4">Active Sessions</h2>

          <ul className="acct-session-list">
            {activeSessions.map((s) => {
              const SIcon = s.Icon;
              return (
                <li key={s.id} className="acct-session-item">
                  <div className="acct-session-icon">
                    <SIcon style={{ fontSize: 20 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="acct-session-device">
                      {s.device} {s.current && <span className="acct-current-tag">This device</span>}
                    </div>
                    <div className="muted text-xs">{s.location} · {s.lastActive}</div>
                  </div>
                  {!s.current && (
                    <button className="acct-revoke-btn" onClick={() => revokeSession(s.id)}>
                      Sign out
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Billing */}
        <section className="glass-card p-6 card-flex">
          <h2 className="section-title mb-4">Billing & Plan</h2>

          <div className="acct-plan-box">
            <div>
              <div className="acct-plan-name">Executive Plan</div>
              <div className="muted text-sm">$499/year · Renews Jan 15, 2027</div>
            </div>
            <button className="btn-secondary" onClick={() => showToast("Redirecting to plan options")}>
              Change Plan
            </button>
          </div>

          <p className="settings-group-label" style={{ marginTop: 20 }}>Payment Method</p>
          <div className="acct-payment-row">
            <CreditCard className="icon-violet" style={{ fontSize: 20 }} />
            <span>Visa ending in 4242</span>
            <button className="link-action" style={{ marginLeft: "auto" }} onClick={() => showToast("Redirecting to payment update")}>
              Update
            </button>
          </div>

          <p className="settings-group-label" style={{ marginTop: 20 }}>Billing History</p>
          <ul className="acct-billing-list">
            {billingHistory.map((b) => (
              <li key={b.id} className="acct-billing-item">
                <div className="min-w-0 flex-1">
                  <div className="acct-billing-plan">{b.plan}</div>
                  <div className="muted text-xs">{b.date}</div>
                </div>
                <span className="acct-billing-amount">{b.amount}</span>
                <span className="badge badge-success">{b.status}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Data & privacy */}
        <section className="glass-card p-6 card-flex">
          <h2 className="section-title mb-4">Data & Privacy</h2>

          <div className="acct-data-row">
            <Shield className="icon-violet" style={{ fontSize: 20 }} />
            <div className="flex-1 min-w-0">
              <div className="acct-verify-title">Download Your Data</div>
              <div className="muted text-xs">Get a copy of everything in your account</div>
            </div>
            <button
              className="btn-secondary"
              onClick={requestDataExport}
              disabled={dataExportRequested}
            >
              <Download style={{ fontSize: 16 }} /> {dataExportRequested ? "Requested" : "Request"}
            </button>
          </div>

          <div className="acct-data-row">
            <Language className="icon-sky" style={{ fontSize: 20 }} />
            <div className="flex-1 min-w-0">
              <div className="acct-verify-title">Privacy Policy</div>
              <div className="muted text-xs">Review how your data is handled</div>
            </div>
            <button className="link-action">View</button>
          </div>

          <div className="settings-divider" />

          <p className="settings-group-label" style={{ color: "#DC2626" }}>Danger Zone</p>

          <div className="acct-danger-row">
            <div>
              <div className="settings-danger-title">Deactivate Account</div>
              <div className="muted text-xs">Temporarily disable your account — you can reactivate anytime</div>
            </div>
            <button className="btn-secondary" onClick={() => showToast("Deactivation request submitted")}>
              <Logout style={{ fontSize: 16 }} /> Deactivate
            </button>
          </div>

          <div className="settings-danger-box" style={{ marginTop: 12 }}>
            <div>
              <div className="settings-danger-title">Delete Account</div>
              <div className="muted text-sm">This action is permanent and cannot be undone.</div>
            </div>
            <input
              type="text"
              className="settings-danger-input"
              placeholder='Type "DELETE" to confirm'
              value={deactivateConfirm}
              onChange={(e) => setDeactivateConfirm(e.target.value)}
            />
            <button className="settings-danger-btn" disabled={deactivateConfirm !== "DELETE"}>
              <DeleteForever style={{ fontSize: 18 }} /> Delete My Account
            </button>
          </div>
        </section>

      </div>

      {toast && (
        <div className="settings-toast">
          <CheckCircle style={{ fontSize: 18 }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}