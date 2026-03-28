import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { apiDelete, parseApiError } from "../utils/api";
import { dateStringFormatter } from "../utils/dateStringFormatter";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/ToastContext";

const InvoiceTable = ({ items, totalFiltered, totalAll, isFiltered, onDelete, onOptimisticDelete, onRollback }) => {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { addToast } = useToast();

  const pendingItem = items.find(i => i._id === pendingDeleteId)
    ?? (pendingDeleteId ? { invoiceNumber: pendingDeleteId } : null);

  const requestDelete = (id) => setPendingDeleteId(id);

  const handleConfirmDelete = () => {
    const id = pendingDeleteId;
    const item = items.find(i => i._id === id);
    setPendingDeleteId(null);

    // Optimistic update – okamžité odstranění z UI
    if (onOptimisticDelete) onOptimisticDelete(id);

    apiDelete("/api/invoices/" + id)
      .then(() => {
        addToast(`Faktura #${item?.invoiceNumber} byla smazána.`, "success");
        if (onDelete) onDelete();
      })
      .catch(e => {
        // Rollback – vrátí položku zpět
        if (onRollback) onRollback(item);
        addToast(parseApiError(e).message, "error");
      });
  };

  const handleCancelDelete = () => setPendingDeleteId(null);

  const fmt = (n) => Number(n).toLocaleString("cs-CZ");

  if (totalFiltered === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <div className="empty-state-title">Žádné faktury</div>
        <div className="empty-state-sub">
          {isFiltered
            ? "Žádná faktura neodpovídá zadaným kritériím."
            : "Zatím nebyly vytvořeny žádné faktury."}
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={14} /> Nová faktura
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Smazat fakturu"
        message={
          pendingItem ? (
            <span>
              Opravdu chcete smazat fakturu{" "}
              <strong style={{ color: "var(--color-text)" }}>
                #{pendingItem.invoiceNumber}
              </strong>
              {pendingItem.product && <> — {pendingItem.product}</>}?
              <span style={{
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
                marginTop: "0.4rem",
                display: "block",
              }}>
                Tato akce je nevratná.
              </span>
            </span>
          ) : "Opravdu chcete smazat tuto fakturu? Tato akce je nevratná."
        }
        confirmLabel="Smazat fakturu"
        cancelLabel="Zrušit"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger
      />

      <div>
        <div style={{
          marginBottom: "0.75rem",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
        }}>
          {isFiltered ? (
            <>
              Nalezeno{" "}
              <strong style={{ color: "var(--color-text)" }}>{totalFiltered}</strong>
              {totalAll != null && <>{" z "}{totalAll}</>}
            </>
          ) : (
            <>
              Celkem{" "}
              <strong style={{ color: "var(--color-text)" }}>{totalFiltered}</strong>
              {" "}faktur
            </>
          )}
        </div>

        <div className="invoice-list">
          {items.map((item) => (
            <div key={item._id} className="invoice-row">
              <div className="invoice-num">#{item.invoiceNumber}</div>

              <div className="invoice-product">
                <span>{item.product}</span>
                {item.issued && (
                  <span className="invoice-date-badge">
                    {dateStringFormatter(item.issued, true)}
                  </span>
                )}
              </div>

              <div className="invoice-person">
                <div className="person-label">Dodavatel</div>
                <Link to={"/persons/show/" + item.seller._id}>
                  {item.seller.name}
                </Link>
              </div>

              <div className="invoice-person">
                <div className="person-label">Odběratel</div>
                <Link to={"/persons/show/" + item.buyer._id}>
                  {item.buyer.name}
                </Link>
              </div>

              <div className="invoice-price">{fmt(item.price)} Kč</div>

              <div className="invoice-actions">
                <Link to={"/invoices/show/" + item._id} className="btn-icon info" title="Detail faktury">
                  <Eye size={14} />
                </Link>
                <Link to={"/invoices/edit/" + item._id} className="btn-icon warning" title="Upravit fakturu">
                  <Pencil size={14} />
                </Link>
                <button
                  className="btn-icon danger"
                  title="Smazat fakturu"
                  onClick={() => requestDelete(item._id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Link to="/invoices/create" className="btn-outline">
            <Plus size={14} /> Nová faktura
          </Link>
        </div>
      </div>
    </>
  );
};

export default InvoiceTable;
