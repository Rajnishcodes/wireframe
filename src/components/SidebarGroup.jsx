import React, { useState } from "react";
import "../styles/Sidebar.css";

import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import {
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

/**
 * ==========================================================
 * Sidebar Group Component
 * ==========================================================
 *
 * Props:
 * ---------------------------------------------
 * icon        -> MUI Icon
 * title       -> Group Title
 * items       -> Child Menu Array
 * collapsed   -> Sidebar Collapse State
 * activeItem  -> Current Active Menu
 * onSelect    -> Callback Function
 *
 */

const SidebarGroup = ({
  icon,
  title,
  items = [],
  collapsed = false,
  activeItem,
  onSelect,
}) => {

  /**
   * Expand / Collapse State
   */

  const [open, setOpen] = useState(true);

  /**
   * Main Group Button
   */

  const GroupButton = (
    <ListItemButton
      className="sb-item"
      onClick={() => setOpen(!open)}
    >
      {/* Icon */}

      <ListItemIcon className="sb-icon">
        {icon}
      </ListItemIcon>

      {/* Text */}

      {!collapsed && (
        <>
          <ListItemText
            primary={title}
            className="sb-text"
          />

          {open ? <ExpandLess /> : <ExpandMore />}
        </>
      )}
    </ListItemButton>
  );

  /**
   * If Sidebar Is Collapsed
   */

  if (collapsed) {
    return (
      <Tooltip
        title={title}
        placement="right"
        arrow
      >
        {GroupButton}
      </Tooltip>
    );
  }

  return (
    <div className="sb-group">

      {GroupButton}

      <Collapse
        in={open}
        timeout={300}
      >
        <List disablePadding>

          {items.map((item) => (

            <ListItemButton
              key={item.id}
              className={`sb-subitem ${
                activeItem === item.id ? "sb-active" : ""
              }`}
              onClick={() => onSelect(item.id)}
            >

              <ListItemIcon className="sb-subicon">
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
              />

            </ListItemButton>

          ))}

        </List>

      </Collapse>

    </div>
  );
};

export default SidebarGroup;