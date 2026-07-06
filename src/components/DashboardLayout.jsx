import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import AIAssistant from "./AIAssistant";

import "../styles/dashboardLayout.css";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="dashboard-main-wrapper">

        <Header
          collapsed={collapsed}
          toggleSidebar={() =>
            setCollapsed(!collapsed)
          }
        />

        <main className="dashboard-main">
          <Outlet />
        </main>

        {/* AI Assistant */}
        <AIAssistant />

      </div>

    </div>
  );
}