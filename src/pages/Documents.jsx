import React from "react";
import "../styles/Documents.css";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  Typography,
  Button,
  IconButton
} from "@mui/material";

import {
  FolderRounded,
  UploadRounded,
  PictureAsPdfRounded,
  SlideshowRounded,
  DescriptionRounded,
  TableChartRounded,
  ArrowForwardRounded,
  DownloadRounded,
  MoreHorizRounded,
} from "@mui/icons-material";

/* ===========================================================
   Folder Data
=========================================================== */

const folders = [
  {
    name: "Board",
    count: 12,
    color: "folder-violet",
  },

  {
    name: "Finance",
    count: 28,
    color: "folder-green",
  },

  {
    name: "Legal",
    count: 9,
    color: "folder-red",
  },

  {
    name: "Product",
    count: 41,
    color: "folder-orange",
  },
];

/* ===========================================================
   Files
=========================================================== */

const files = [
  {
    name: "Q3 Financial Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    updated: "2h ago",
    icon: "pdf",
    color: "pdf",
  },

  {
    name: "Board Deck - June.pptx",
    type: "Slides",
    size: "8.1 MB",
    updated: "1d ago",
    icon: "slides",
    color: "slides",
  },

  {
    name: "Partnership MOU.docx",
    type: "Document",
    size: "184 KB",
    updated: "3d ago",
    icon: "doc",
    color: "doc",
  },

  {
    name: "Hiring Plan 2026.xlsx",
    type: "Spreadsheet",
    size: "612 KB",
    updated: "5d ago",
    icon: "sheet",
    color: "sheet",
  },

  {
    name: "Brand Guidelines.pdf",
    type: "PDF",
    size: "12.7 MB",
    updated: "1 Week Ago",
    icon: "pdf",
    color: "pdf",
  },

  {
    name: "Investor Update.docx",
    type: "Document",
    size: "248 KB",
    updated: "2 Weeks Ago",
    icon: "doc",
    color: "doc",
  },
];

/* ===========================================================
   Icon Selector
=========================================================== */

const getFileIcon = (type) => {
  switch (type) {
    case "pdf":
      return <PictureAsPdfRounded />;

    case "slides":
      return <SlideshowRounded />;

    case "doc":
      return <DescriptionRounded />;

    case "sheet":
      return <TableChartRounded />;

    default:
      return <DescriptionRounded />;
  }
};

/* ===========================================================
   Component
=========================================================== */

const Documents = () => {
  return (
    <div className="container-fluid py-4">

      {/* =====================================================
            Header
      ===================================================== */}

      <div className="documents-header">

        <div className="documents-left">

          <div className="documents-icon">

            <FolderRounded />

          </div>

          <div>

            <Typography
              variant="h4"
              className="page-title"
            >
              Documents
            </Typography>

            <Typography
              className="page-subtitle"
            >
              4 folders • 90 files • 1.2 GB Used
            </Typography>

          </div>

        </div>

        <Button
          variant="contained"
          startIcon={<UploadRounded />}
          className="upload-btn"
        >
          Upload
        </Button>

      </div>

      {/* =====================================================
            Folder Cards
      ===================================================== */}

      <div className="row g-4 mb-4">

        {folders.map((folder) => (

          <div
            key={folder.name}
            className="col-12 col-sm-6 col-lg-3"
          >

            <div
              className={`folder-card ${folder.color}`}
            >

              <FolderRounded className="folder-icon" />

              <Typography
                className="folder-name"
              >
                {folder.name}
              </Typography>

              <Typography
                className="folder-count"
              >
                {folder.count} Files
              </Typography>

            </div>

          </div>

        ))}

      </div>

      {/* =====================================================
            Recent Files
      ===================================================== */}

      <div className="documents-card">

        <div className="documents-card-header">

          <Typography
            variant="h6"
            className="recent-title"
          >
            Recent Files
          </Typography>

          <Button
            endIcon={<ArrowForwardRounded />}
            className="view-all-btn"
          >
            View All
          </Button>

        </div>

        <div className="file-list">

          {files.map((file, index) => (

            <div
              key={index}
              className="file-row"
            >

              {/* File Icon */}

              <div
                className={`file-icon ${file.color}`}
              >
                {getFileIcon(file.icon)}
              </div>

              {/* File Details */}

              <div className="file-info">

                <Typography
                  className="file-name"
                >
                  {file.name}
                </Typography>

                <Typography
                  className="file-meta"
                >
                  {file.type} • {file.size} • {file.updated}
                </Typography>

              </div>

              {/* Actions */}

              <IconButton className="action-btn">

                <DownloadRounded />

              </IconButton>

              <IconButton className="action-btn">

                <MoreHorizRounded />

              </IconButton>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Documents;