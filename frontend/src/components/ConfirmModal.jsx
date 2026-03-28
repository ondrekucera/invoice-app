import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Znovupoužitelný potvrzovací modal.
 *
 * Props:
 *   isOpen       – boolean, zda je modal viditelný
 *   title        – hlavní nadpis modalu (string)
 *   message      – popis / varování (string nebo JSX)
 *   confirmLabel – text potvrzovacího tlačítka (default: "Smazat")
 *   cancelLabel  – text zrušovacího tlačítka  (default: "Zrušit")
 *   onConfirm    – callback po potvrzení
 *   onCancel     – callback po zrušení / zavření
 *   danger       – boolean, zda jde o nebezpečnou akci (červené confirm tlačítko)
 */
const ConfirmModal = ({
  isOpen,
  title = "Potvrdit akci",
  message,
  confirmLabel = "Smazat",
  cancelLabel  = "Zrušit",
  onConfirm,
  onCancel,
  danger = true,
}) => {
  const cancelBtnRef = useRef(null);

  /* Fokus na Zrušit při otevření – bezpečnější default */
  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [isOpen]);

  /* Zavření přes Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon-wrap" style={{
            background: danger ? "rgba(239,68,68,0.1)" : "rgba(124,58,237,0.1)",
          }}>
            <AlertTriangle
              size={20}
              style={{ color: danger ? "var(--color-danger)" : "var(--color-primary)" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div id="confirm-modal-title" className="confirm-modal-title">{title}</div>
          </div>
          <button
            className="confirm-modal-close"
            onClick={onCancel}
            title="Zavřít"
            aria-label="Zavřít dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {message && (
          <div className="confirm-modal-body">
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="confirm-modal-footer">
          <button
            ref={cancelBtnRef}
            className="btn-outline"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
