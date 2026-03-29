import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, User } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import { CATEGORY_LABELS } from "./PersonForm";

const PersonTable = ({ items, deletePerson, totalFiltered, totalAll, isFiltered }) => {
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);

  const requestDelete = (item) => setPendingDeleteItem(item);
  const handleCancel  = ()     => setPendingDeleteItem(null);
  const handleConfirm = ()     => {
    deletePerson(pendingDeleteItem._id);
    setPendingDeleteItem(null);
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
    <>
      <ConfirmModal
        isOpen={pendingDeleteItem !== null}
        title="Smazat osobu"
        message={
          pendingDeleteItem ? (
            <span>
              Opravdu chcete smazat osobu{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {pendingDeleteItem.name}
              </strong>?
              <span style={{
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
                marginTop: "0.4rem",
                display: "block",
              }}>
                Tato akce je nevratná.
              </span>
            </span>
          ) : "Opravdu chcete smazat tuto osobu? Tato akce je nevratná."
        }
        confirmLabel="Smazat osobu"
        cancelLabel="Zrušit"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
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
                <div className="invoice-product" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {item.name}
                  {item.category && (
                    <span className="category-badge">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  )}
                </div>
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
                {item._id && (
                  <Link to={"/persons/show/" + item._id} className="btn-icon info" title="Detail osoby">
                    <Eye size={14} />
                  </Link>
                )}
                {item._id && (
                  <Link to={"/persons/edit/" + item._id} className="btn-icon warning" title="Upravit osobu">
                    <Pencil size={14} />
                  </Link>
                )}
                <button
                  className="btn-icon danger"
                  title="Smazat osobu"
                  onClick={() => requestDelete(item)}
                >
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
    </>
  );
};

export default PersonTable;
