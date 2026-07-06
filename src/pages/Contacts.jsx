import React from "react";
import "../styles/Contacts.css";

import "bootstrap/dist/css/bootstrap.min.css";

import {
  Button,
  Chip,
  Typography,
} from "@mui/material";

import {
  ContactsRounded,
  AddRounded,
  EmailRounded,
  CallRounded,
} from "@mui/icons-material";

/* ==========================================================
   Contact Data
========================================================== */

const contacts = [
  {
    name: "Ava Martinez",
    role: "CFO · Acme Co.",
    email: "ava@acme.com",
    phone: "+1 (415) 555-0118",
    tag: "Investor",
  },

  {
    name: "Liam Chen",
    role: "VP Product · Northwind",
    email: "liam@northwind.com",
    phone: "+1 (650) 555-0142",
    tag: "Partner",
  },

  {
    name: "Sophia Patel",
    role: "Managing Partner · Lumen VC",
    email: "sophia@lumen.vc",
    phone: "+1 (212) 555-0177",
    tag: "Investor",
  },

  {
    name: "Noah Wright",
    role: "Head of Design · Atlas",
    email: "noah@atlas.io",
    phone: "+1 (415) 555-0163",
    tag: "Vendor",
  },

  {
    name: "Mia Johansson",
    role: "GC · Bright Legal",
    email: "mia@brightlegal.com",
    phone: "+1 (646) 555-0190",
    tag: "Legal",
  },

  {
    name: "Ethan Park",
    role: "Engineering Lead",
    email: "ethan@executivehub.app",
    phone: "+1 (415) 555-0101",
    tag: "Team",
  },
];

/* ==========================================================
   Tag Colors
========================================================== */

const getTagColor = (tag) => {

  switch (tag) {

    case "Investor":
      return "investor";

    case "Partner":
      return "partner";

    case "Vendor":
      return "vendor";

    case "Legal":
      return "legal";

    case "Team":
      return "team";

    default:
      return "";
  }

};

/* ==========================================================
   Component
========================================================== */

const Contacts = () => {

  return (

    <div className="container-fluid py-4">

      {/* ===================================================
          Header
      =================================================== */}

      <div className="contacts-header">

        <div className="contacts-title">

          <div className="contacts-icon">

            <ContactsRounded />

          </div>

          <div>

            <Typography
              variant="h4"
              className="page-title"
            >
              Contacts
            </Typography>

            <Typography
              className="page-subtitle"
            >
              6 contacts • synced across calendar &
              meetings
            </Typography>

          </div>

        </div>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className="add-contact-btn"
        >
          Add Contact
        </Button>

      </div>

      {/* ===================================================
          Contact Grid
      =================================================== */}

      <div className="row g-4">

        {contacts.map((contact, index) => (

          <div
            key={index}
            className="col-12 col-md-6 col-xl-4"
          >

            <div className="contact-card">

              {/* ==========================================
                  Top
              ========================================== */}

              <div className="contact-top">

                {/* Avatar */}

                <div className="contact-avatar">

                  {contact.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}

                </div>

                {/* Info */}

                <div className="contact-info">

                  <Typography
                    className="contact-name"
                  >
                    {contact.name}
                  </Typography>

                  <Typography
                    className="contact-role"
                  >
                    {contact.role}
                  </Typography>

                </div>

                {/* Tag */}

                <Chip
                  label={contact.tag}
                  className={`contact-tag ${getTagColor(
                    contact.tag
                  )}`}
                  size="small"
                />

              </div>

              {/* ==========================================
                  Details
              ========================================== */}

              <div className="contact-details">

                <div className="detail-row">

                  <EmailRounded
                    className="detail-icon"
                  />

                  <span>

                    {contact.email}

                  </span>

                </div>

                <div className="detail-row">

                  <CallRounded
                    className="detail-icon"
                  />

                  <span>

                    {contact.phone}

                  </span>

                </div>

              </div>

              {/* ==========================================
                  Actions
              ========================================== */}

              <div className="contact-actions">

                <Button
                  variant="outlined"
                  startIcon={<EmailRounded />}
                  className="email-btn"
                  fullWidth
                >
                  Email
                </Button>

                <Button
                  variant="contained"
                  startIcon={<CallRounded />}
                  className="call-btn"
                  fullWidth
                >
                  Call
                </Button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default Contacts;