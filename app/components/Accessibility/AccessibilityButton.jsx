"use client";

import { useEffect, useState, useRef } from "react";

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dyslexicFontEnabled");
      if (stored === "true") {
        setEnabled(true);
        document.documentElement.classList.add("dyslexic-font");
      }
      const inv = localStorage.getItem("invertedColorsEnabled");
      if (inv === "true") {
        setInverted(true);
        document.documentElement.classList.add("inverted");
      }
      const highlight = localStorage.getItem("highlightLinksEnabled");
      if (highlight === "true") {
        setHighlightLinks(true);
        document.documentElement.classList.add("highlight-links");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("dyslexic-font");
      localStorage.setItem("dyslexicFontEnabled", "true");
    } else {
      document.documentElement.classList.remove("dyslexic-font");
      localStorage.setItem("dyslexicFontEnabled", "false");
    }
  }, [enabled]);

  useEffect(() => {
    if (inverted) {
      document.documentElement.classList.add("inverted");
      localStorage.setItem("invertedColorsEnabled", "true");
    } else {
      document.documentElement.classList.remove("inverted");
      localStorage.setItem("invertedColorsEnabled", "false");
    }
  }, [inverted]);

  useEffect(() => {
    if (highlightLinks) {
      document.documentElement.classList.add("highlight-links");
      localStorage.setItem("highlightLinksEnabled", "true");
    } else {
      document.documentElement.classList.remove("highlight-links");
      localStorage.setItem("highlightLinksEnabled", "false");
    }
  }, [highlightLinks]);

  // Close menu when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  return (
    <div className="accessibility-root" ref={rootRef}>
      <button
        aria-label="Accessibility menu"
        className="accessibility-button"
        onClick={() => setOpen((v) => !v)}
        title="Accessibility"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M4.5 4c0-1.11.89-2 2-2s2 .89 2 2s-.89 2-2 2s-2-.89-2-2m5.5 6.95V9c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6h2v7h3.5v-.11c-1.24-1.26-2-2.99-2-4.89c0-2.58 1.41-4.84 3.5-6.05M16.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3c0-1.11.61-2.06 1.5-2.58v-2.16c-2.02.64-3.5 2.51-3.5 4.74c0 2.76 2.24 5 5 5s5-2.24 5-5zm3.04-3H15V8h-2v8h5.46l2.47 3.71l1.66-1.11z"
          />
        </svg>
      </button>

      {open && (
        <div
          className="accessibility-menu animate-fade-in"
          role="dialog"
          aria-label="Accessibility options"
        >
          <div className="accessibility-menu-header">Accessibility</div>

          <button
            type="button"
            className={`accessibility-card ${enabled ? "active" : ""}`}
            onClick={() => setEnabled((v) => !v)}
            aria-pressed={enabled}
          >
            <div className="accessibility-texts">
              <div className="accessibility-title">Dyslexic Font</div>
              <div className="accessibility-sub">
                Improves text readability for people with dyslexia
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`accessibility-card ${inverted ? "active" : ""}`}
            onClick={() => setInverted((v) => !v)}
            aria-pressed={inverted}
          >
            <div className="accessibility-texts">
              <div className="accessibility-title">Invert Colors</div>
              <div className="accessibility-sub">
                Inverts website colors for better contrast
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`accessibility-card ${highlightLinks ? "active" : ""}`}
            onClick={() => setHighlightLinks((v) => !v)}
            aria-pressed={highlightLinks}
          >
            <div className="accessibility-texts">
              <div className="accessibility-title">Highlight Links</div>
              <div className="accessibility-sub">
                Highlights all links and buttons with bright outline
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
