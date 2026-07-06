import React from "react";
import "../styles/Sidebar.css";

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

/**
 * ======================================================
 * Sidebar Item
 * ======================================================
 *
 * Props
 * ----------------------------------
 * icon        -> MUI Icon Component
 * title       -> Menu Name
 * active      -> Boolean
 * collapsed   -> Boolean
 * onClick     -> Function
 *
 */

const SidebarItem = ({
  icon,
  title,
  active,
  collapsed,
  onClick,
}) => {
  const menuItem = (
    <ListItemButton
      onClick={onClick}
      className={`sb-item ${active ? "sb-active" : ""}`}
    >
      {/* Icon */}

      <ListItemIcon className="sb-icon">
        {icon}
      </ListItemIcon>

      {/* Text */}

      {!collapsed && (
        <ListItemText
          primary={title}
          className="sb-text"
        />
      )}

      {/* Active Indicator */}

      {active && !collapsed && (
        <span className="sb-active-indicator"></span>
      )}
    </ListItemButton>
  );

  /**
   * Show Tooltip Only When Sidebar Is Collapsed
   */

  if (collapsed) {
    return (
      <Tooltip
        title={title}
        placement="right"
        arrow
      >
        {menuItem}
      </Tooltip>
    );
  }

  return menuItem;
};

export default SidebarItem;