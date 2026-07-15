import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Contacts from "./pages/Contacts";
import Documents from "./pages/Documents";
import MeetingsPage from "./pages/MeetingsPage";
import Notes from "./pages/Notes";
import Reminders from "./pages/Reminders";
import Task from "./pages/Task";

import DashboardLayout from "./components/DashboardLayout";
import SettingsPage from "./pages/SettingsPage";
import MyProfile from "./pages/MyProfile";
import AccountSettings from "./pages/AccountSettings";
import Onedrive from "./pages/Onedrive";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmailPage from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { AuthProvider } from "./context/AuthContext";

// Pages an Admin should NOT be able to open (Super Admin + regular User only)
const RESTRICTED_FROM_ADMIN = ["superadmin", "user"];

// Only Super Admin can create new accounts
const SUPERADMIN_ONLY = ["superadmin"];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
                  <RegisterPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected — share Header + Sidebar layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Allowed for ALL logged-in roles (Super Admin, Admin, User) */}
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/tasks" element={<Task />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/onedrive" element={<Onedrive />} />

            {/* Restricted from Admin */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <Dashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <Calendar />
                </RoleRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <Contacts />
                </RoleRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <Documents />
                </RoleRoute>
              }
            />
            <Route
              path="/reminders"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <Reminders />
                </RoleRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <SettingsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <MyProfile />
                </RoleRoute>
              }
            />
            <Route
              path="/accountsettings"
              element={
                <RoleRoute allowedRoles={RESTRICTED_FROM_ADMIN}>
                  <AccountSettings />
                </RoleRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;