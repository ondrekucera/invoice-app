import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { apiDelete } from "../utils/api";

/**
 * Props:
 *   items        – aktuálně zobrazená stránka faktur
 *   totalFiltered – celkový počet po filtraci
 *   totalAll     – celkový počet bez filtru (volitelný)
 *   isFiltered   – příznak aktivního filtru
 *   onDelete     – callback po smazání
 */
const InvoiceTable = ({ items, totalFiltered, totalAll, isFiltered, onDelete }) => {
  const handleDelete = (id) => {
    if (window.confirm("Opravdu chcete smazat tuto fakturu?")) {
      apiDelete("/api/invoices/" + id)
        .then(() => { if (onDelete) onDelete(); })
        .catch(e => alert("Chyba při mazání: " + e.message));
    }
  };

  const fmt = (n) => Number(n).toLocaleString("cs-CZ");

  /* Prázdný stav */
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
            <Plus size={14} /> Vytvořit fakturu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Info řádek */}
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

      {/* Seznam */}
      <div className="invoice-list">
        {items.map((item) => (
          <div key={item._id} className="invoice-row">
            <div className="invoice-num">#{item.invoiceNumber}</div>

            <div className="invoice-product">{item.product}</div>

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
              <button className="btn-icon danger" title="Smazat fakturu" onClick={() => handleDelete(item._id)}>
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
  );
};

export default InvoiceTable;
