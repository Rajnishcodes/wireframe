import { useRef, useState, useEffect, useCallback } from "react";
import {
  Close,
  Undo,
  Delete,
  Brush,
  AutoFixNormal,
  Save,
} from "@mui/icons-material";

import "../styles/Whiteboard.css";

const COLORS = ["#1E1B2E", "#7C3AED", "#DC2626", "#059669", "#D97706", "#0284C7"];
const BRUSH_SIZES = [3, 6, 10];

export default function Whiteboard({ initialData, onSave, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]); // stack of dataURLs for undo

  const [tool, setTool] = useState("pen"); // "pen" | "eraser"
  const [color, setColor] = useState(COLORS[1]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [canUndo, setCanUndo] = useState(false);

  // Set up canvas dimensions matching its displayed size, and load
  // any previously saved drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pushHistory();
      };
      img.src = initialData;
    } else {
      pushHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
    // Cap history so memory doesn't grow unbounded on long drawing sessions
    if (historyRef.current.length > 30) historyRef.current.shift();
    setCanUndo(historyRef.current.length > 1);
  }, []);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getPoint(e);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pushHistory();
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop(); // remove current state
    const previous = historyRef.current[historyRef.current.length - 1];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previous;

    setCanUndo(historyRef.current.length > 1);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="whiteboard-overlay">
      <div className="whiteboard-modal">

        <div className="whiteboard-header">
          <div className="whiteboard-title">
            <Brush style={{ fontSize: 20 }} /> Whiteboard
          </div>
          <button className="whiteboard-icon-btn" onClick={onClose}>
            <Close />
          </button>
        </div>

        <div className="whiteboard-toolbar">
          <div className="whiteboard-tool-group">
            <button
              className={`whiteboard-tool-btn ${tool === "pen" ? "whiteboard-tool-active" : ""}`}
              onClick={() => setTool("pen")}
              title="Pen"
            >
              <Brush style={{ fontSize: 18 }} />
            </button>
            <button
              className={`whiteboard-tool-btn ${tool === "eraser" ? "whiteboard-tool-active" : ""}`}
              onClick={() => setTool("eraser")}
              title="Eraser"
            >
              <AutoFixNormal style={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="whiteboard-color-group">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`whiteboard-color-dot ${color === c && tool === "pen" ? "whiteboard-color-active" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c);
                  setTool("pen");
                }}
                title={c}
              />
            ))}
          </div>

          <div className="whiteboard-size-group">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                className={`whiteboard-size-btn ${brushSize === s ? "whiteboard-size-active" : ""}`}
                onClick={() => setBrushSize(s)}
                title={`Brush size ${s}`}
              >
                <span style={{ width: s + 4, height: s + 4 }} className="whiteboard-size-dot" />
              </button>
            ))}
          </div>

          <div className="whiteboard-action-group">
            <button className="whiteboard-icon-btn" onClick={handleUndo} disabled={!canUndo} title="Undo">
              <Undo style={{ fontSize: 18 }} />
            </button>
            <button className="whiteboard-icon-btn" onClick={handleClear} title="Clear all">
              <Delete style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        <div className="whiteboard-canvas-wrap" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="whiteboard-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>

        <div className="whiteboard-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-gradient" style={{ width: "auto", padding: "10px 24px" }} onClick={handleSave}>
            <Save style={{ fontSize: 16 }} /> Save Drawing
          </button>
        </div>

      </div>
    </div>
  );
}