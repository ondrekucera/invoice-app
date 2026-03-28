import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { apiGet, apiDelete } from "../utils/api";
import { dateStringFormatter } from "../utils/dateStringFormatter";
import ConfirmModal from "../components/ConfirmModal";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice]         = useState({ buyer: {}, seller: {} });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    apiGet("/api/invoices/" + id)
      .then(data => { setInvoice(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  }, [id]);

  const handleDeleteRequest = () => setConfirmOpen(true);

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    apiDelete("/api/invoices/" + id)
      .then(() => navigate("/invoices"))
      .catch(e => alert("Chyba: " + e.message));
  };

  const handleCancelDelete = () => setConfirmOpen(false);

  const fmt = (n) => Number(n).toLocaleString("cs-CZ");

  const isDueDatePast = invoice.dueDate
    ? new Date(invoice.dueDate) < new Date()
    : false;

  if (loading)
    return <div className="loading-spinner"><div className="spinner" />Načítám fakturu...</div>;

  if (error)
    return <div className="alert alert-danger">Chyba: {error}</div>;

  return (
    <>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Smazat fakturu"
        message={
          <span>
            Opravdu chcete smazat fakturu{" "}
            <strong style={{ color: "var(--color-text)" }}>#{invoice.invoiceNumber}</strong>
            {invoice.product && <> — {invoice.product}</>}?
            <span style={{
              fontSize: "0.82rem",
              color: "var(--color-text-muted)",
              marginTop: "0.4rem",
              display: "block",
            }}>
              Tato akce je nevratná.
            </span>
          </span>
        }
        confirmLabel="Smazat fakturu"
        cancelLabel="Zrušit"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger
      />

      <div>
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-eyebrow">Faktura</div>
            <h1 className="page-title">#{invoice.invoiceNumber}</h1>
            <div className="page-sub">{invoice.product}</div>
          </div>
          <div className="page-actions">
            <Link to="/invoices" className="btn-outline">
              <ArrowLeft size={14} /> Zpět na faktury
            </Link>
            <Link to={"/invoices/edit/" + id} className="btn-primary">
              <Pencil size={14} /> Upravit fakturu
            </Link>
            <button
              className="btn-icon danger"
              onClick={handleDeleteRequest}
              title="Smazat fakturu"
              style={{ padding: "0.5rem 0.65rem" }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{
            padding: "1.25rem 1.5rem",
            margin: "-1.5rem -1.5rem 1.5rem",
            background: "linear-gradient(135deg, rgba(66,38,128,0.2), rgba(102,15,86,0.15))",
            borderBottom: "1px solid var(--color-border)",
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div className="stat-label" style={{ marginBottom: "0.2rem" }}>Cena bez DPH</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
                {fmt(invoice.price)} Kč
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-label" style={{ marginBottom: "0.2rem" }}>Cena s DPH ({invoice.vat} %)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
                {fmt(Math.round(invoice.price * (1 + invoice.vat / 100)))} Kč
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <div className="detail-label">Produkt</div>
              <div className="detail-value" style={{ fontWeight: 700 }}>{invoice.product}</div>
            </div>
            <div>
              <div className="detail-label">DPH</div>
              <div className="detail-value">{invoice.vat} %</div>
            </div>
            <div>
              <div className="detail-label">Datum vystavení</div>
              <div className="detail-value">
                {invoice.issued && dateStringFormatter(invoice.issued, true)}
              </div>
            </div>
            <div>
              <div className="detail-label">Datum splatnosti</div>
              <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {invoice.dueDate && dateStringFormatter(invoice.dueDate, true)}
                {isDueDatePast && (
                  <span className="due-date-warning" title="Datum splatnosti již uplynulo">
                    <AlertTriangle size={13} />
                    Po splatnosti
                  </span>
                )}
              </div>
            </div>
            {invoice.note && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="detail-label">Poznámka</div>
                <div className="detail-value" style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  {invoice.note}
                </div>
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="detail-grid">
            <div>
              <div className="detail-label">Dodavatel</div>
              <div className="detail-value">
                {invoice.seller?._id
                  ? <Link to={"/persons/show/" + invoice.seller._id}
                      style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                      {invoice.seller.name}
                    </Link>
                  : "—"}
              </div>
            </div>
            <div>
              <div className="detail-label">Odběratel</div>
              <div className="detail-value">
                {invoice.buyer?._id
                  ? <Link to={"/persons/show/" + invoice.buyer._id}
                      style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                      {invoice.buyer.name}
                    </Link>
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
