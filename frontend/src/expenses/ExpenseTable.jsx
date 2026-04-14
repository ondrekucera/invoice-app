import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Receipt } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("cs-CZ");

const formatAmount = (value) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(value ?? 0);

const ExpenseTable = ({ items, deleteExpense }) => {
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);

  const requestDelete = (item) => setPendingDeleteItem(item);
  const handleCancel = () => setPendingDeleteItem(null);
  const handleConfirm = () => {
    deleteExpense(pendingDeleteItem._id);
    setPendingDeleteItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Receipt size={32} /></div>
        <div className="empty-state-title">Žádné náklady</div>
        <div className="empty-state-sub">Zatím nebyly přidány žádné náklady.</div>
        <div style={{ marginTop: "1.25rem" }}>
          <Link to="/expenses/create" className="btn-primary">
            <Plus size={14} /> Přidat náklad
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={pendingDeleteItem !== null}
        title="Smazat náklad"
        message="Opravdu chcete smazat tento náklad?"
        confirmLabel="Smazat"
        cancelLabel="Zrušit"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        danger
      />

      <div>
        <div className="invoice-list">
          {items.map((item) => (
            <div
              key={item._id}
              className="invoice-row"
              style={{ gridTemplateColumns: "100px 1fr auto auto" }}
            >
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                {formatDate(item.date)}
              </div>

              <div className="invoice-product">{item.description}</div>

              <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                {formatAmount(item.amount)}
              </div>

              <div className="invoice-actions">
                <Link to={"/expenses/show/" + item._id} className="btn-icon info" title="Detail">
                  <Eye size={14} />
                </Link>
                <Link to={"/expenses/edit/" + item._id} className="btn-icon warning" title="Upravit">
                  <Pencil size={14} />
                </Link>
                <button
                  className="btn-icon danger"
                  title="Smazat"
                  onClick={() => requestDelete(item)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Link to="/expenses/create" className="btn-outline">
            <Plus size={14} /> Nový náklad
          </Link>
        </div>
      </div>
    </>
  );
};

export default ExpenseTable;
