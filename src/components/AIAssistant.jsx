import { useState } from "react";
import "../styles/AIAssistant.css";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating icon */}
      <button
        className="assistant-fab"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {/* Chat popup */}
      {open && (
        <div className="assistant-popup">

          <div className="assistant-popup-header">
            <span>AI Assistant</span>

            <button
              className="assistant-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="assistant-popup-body">
            <p>
              Hi 👋 I'm your AI assistant.
            </p>

            <p>
              Ask me to:
            </p>

            <ul>
              <li>Schedule meetings</li>
              <li>Create tasks</li>
              <li>Set reminders</li>
            </ul>
          </div>

        </div>
      )}
    </>
  );
}