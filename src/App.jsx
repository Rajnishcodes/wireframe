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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected — share Header + Sidebar layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/calendar"   element={<Calendar />} />
          <Route path="/contacts"   element={<Contacts />} />
          <Route path="/documents"  element={<Documents />} />
          <Route path="/meetings"   element={<MeetingsPage />} />
          <Route path="/notes"      element={<Notes />} />
          <Route path="/reminders"  element={<Reminders />} />
          <Route path="/tasks"      element={<Task />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;