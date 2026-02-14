"use client"

import { useEffect, useState, useRef } from "react";

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [inverted, setInverted] = useState(false);
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
        title="Доступность"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a2 2 0 100 4 2 2 0 000-4zM6 8a6 6 0 1112 0v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="accessibility-menu animate-fade-in" role="dialog" aria-label="Accessibility options">
          <div className="accessibility-menu-header">Доступность</div>

          <button
            type="button"
            className={`accessibility-card ${enabled ? "active" : ""}`}
            onClick={() => setEnabled((v) => !v)}
            aria-pressed={enabled}
          >
            <div className="accessibility-texts">
              <div className="accessibility-title">Шрифт для дислексиков</div>
              <div className="accessibility-sub">Улучшает читаемость текста для людей с дислексией</div>
            </div>
          </button>

          <button
            type="button"
            className={`accessibility-card ${inverted ? "active" : ""}`}
            onClick={() => setInverted((v) => !v)}
            aria-pressed={inverted}
          >
            <div className="accessibility-texts">
              <div className="accessibility-title">Инвертировать цвета</div>
              <div className="accessibility-sub">Инвертирует цвета сайта для контрастности</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
