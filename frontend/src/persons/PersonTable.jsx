import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, User } from "lucide-react";

/**
 * Props:
 *   items         – aktuálně zobrazená stránka
 *   deletePerson  – callback pro smazání
 *   totalFiltered – počet po filtraci (pro info řádek)
 *   totalAll      – celkový počet bez filtru
 *   isFiltered    – příznak aktivního filtru
 */
const PersonTable = ({ items, deletePerson, totalFiltered, totalAll, isFiltered }) => {
  const handleDelete = (item) => {
    if (window.confirm(`Opravdu chcete smazat osobu ${item.name}?`)) {
      deletePerson(item._id);
    }
  };

  if (totalFiltered === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <div className="empty-state-title">Žádné osoby</div>
        <div className="empty-state-sub">
          {isFiltered
            ? "Žádná osoba neodpovídá zadanému filtru."
            : "Zatím nebyly přidány žádné osoby."}
        </div>
        {!isFiltered && (
          <div style={{ marginTop: "1.25rem" }}>
            <Link to="/persons/create" className="btn-primary">
              <Plus size={14} /> Přidat osobu
            </Link>
          </div>
        )}
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
            {" z "}{totalAll}
          </>
        ) : (
          <>
            Celkem{" "}
            <strong style={{ color: "var(--color-text)" }}>{totalAll}</strong>
            {" "}osob
          </>
        )}
      </div>

      {/* Seznam */}
      <div className="invoice-list">
        {items.map((item) => (
          <div
            key={item._id}
            className="invoice-row"
            style={{ gridTemplateColumns: "40px 1fr auto" }}
          >
            <div className="invoice-num" style={{ display: "flex", alignItems: "center" }}>
              <User size={14} style={{ opacity: 0.45 }} />
            </div>

            <div>
              <div className="invoice-product">{item.name}</div>
              {item.identificationNumber && (
                <div style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-dim)",
                  marginTop: "0.1rem",
                }}>
                  IČO: {item.identificationNumber}
                  {item.city && (
                    <span style={{ marginLeft: "0.75rem" }}>{item.city}</span>
                  )}
                </div>
              )}
            </div>

            <div className="invoice-actions">
              <Link to={"/persons/show/" + item._id} className="btn-icon info" title="Detail">
                <Eye size={14} />
              </Link>
              <Link to={"/persons/edit/" + item._id} className="btn-icon warning" title="Upravit">
                <Pencil size={14} />
              </Link>
              <button className="btn-icon danger" title="Smazat" onClick={() => handleDelete(item)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/persons/create" className="btn-outline">
          <Plus size={14} /> Nová osoba
        </Link>
      </div>
    </div>
  );
};

export default PersonTable;
