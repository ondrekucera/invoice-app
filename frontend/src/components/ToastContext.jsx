import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Loader } from "lucide-react";

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const scheduleRemoval = useCallback((id, duration) => {
    const fadeTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, duration - 400);
    const removeTimer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timersRef.current[id];
    }, duration);
    timersRef.current[id] = { fadeTimer, removeTimer };
  }, []);

  const clearTimers = useCallback((id) => {
    const t = timersRef.current[id];
    if (t) {
      clearTimeout(t.fadeTimer);
      clearTimeout(t.removeTimer);
      delete timersRef.current[id];
    }
  }, []);

  // Přidá nový toast. Pokud type="loading", auto-hide se nespustí.
  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    if (type !== "loading") {
      scheduleRemoval(id, duration);
    }
    return id;
  }, [scheduleRemoval]);

  // Aktualizuje existující toast – lze změnit message, type i duration
  const updateToast = useCallback((id, patch, duration = 3000) => {
    clearTimers(id);
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, ...patch, exiting: false } : t
    ));
    if ((patch.type ?? "info") !== "loading") {
      scheduleRemoval(id, duration);
    }
  }, [clearTimers, scheduleRemoval]);

  const removeToast = useCallback((id) => {
    clearTimers(id);
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, [clearTimers]);

  return (
    <ToastContext.Provider value={{ addToast, updateToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast musí být použit uvnitř ToastProvider");
  return ctx;
};

const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "i",
  loading: null,
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}${toast.exiting ? " toast-exit" : " toast-enter"}`}
          role="alert"
        >
          <span className="toast-icon">
            {toast.type === "loading"
              ? <Loader size={13} className="toast-spinner" />
              : (ICONS[toast.type] || ICONS.info)
            }
          </span>
          <span className="toast-message">{toast.message}</span>
          {toast.type !== "loading" && (
            <button
              className="toast-close"
              onClick={() => onRemove(toast.id)}
              aria-label="Zavřít"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
