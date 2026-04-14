import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import { apiGet, getErrorMessage } from "../utils/api";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatAmount = (value) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(value ?? 0);

const ExpenseDetail = () => {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/api/expenses/" + id)
      .then(data => { setExpense(data); setLoading(false); })
      .catch(e => { setError(getErrorMessage(e)); setLoading(false); });
  }, [id]);

  if (loading)
    return <div className="loading-spinner"><div className="spinner" />Načítám náklad...</div>;

  if (error)
    return <div className="alert alert-danger">Chyba: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Detail</div>
          <h1 className="page-title">Náklad</h1>
        </div>
        <div className="page-actions">
          <Link to="/expenses" className="btn-outline">
            <ArrowLeft size={14} /> Zpět
          </Link>
          <Link to={"/expenses/edit/" + id} className="btn-primary">
            <Pencil size={14} /> Upravit
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div>
            <div className="detail-label">Datum</div>
            <div className="detail-value">{formatDate(expense.date)}</div>
          </div>
          <div>
            <div className="detail-label">Částka</div>
            <div className="detail-value">{formatAmount(expense.amount)}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="detail-label">Popis</div>
            <div className="detail-value">{expense.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
