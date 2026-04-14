import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut, parseApiError } from "../utils/api";
import { useToast } from "../components/ToastContext";

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { addToast, updateToast } = useToast();

  const [expense, setExpense] = useState({ date: "", amount: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) {
      apiGet("/api/expenses/" + id)
        .then(data => {
          setExpense({
            date: data.date ?? "",
            amount: data.amount ?? "",
            description: data.description ?? "",
          });
          setFetchLoading(false);
        })
        .catch(e => { setError(parseApiError(e).message); setFetchLoading(false); });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    setExpense(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setValidationErrors({});

    const payload = {
      date: expense.date || null,
      amount: expense.amount !== "" ? Number(expense.amount) : null,
      description: expense.description,
    };

    const toastId = addToast(
      isEditing ? "Ukládám náklad..." : "Vytvářím náklad...",
      "loading"
    );

    (id ? apiPut("/api/expenses/" + id, payload) : apiPost("/api/expenses", payload))
      .then(() => {
        updateToast(toastId, {
          message: isEditing ? "Náklad byl uložen." : "Náklad byl vytvořen.",
          type: "success",
        });
        navigate("/expenses");
      })
      .catch(e => {
        const { message, validationErrors: ve } = parseApiError(e);
        if (ve) {
          setValidationErrors(ve);
          setError("Formulář obsahuje chyby. Zkontrolujte vyplněná pole.");
          updateToast(toastId, { message: "Formulář obsahuje chyby.", type: "error" });
        } else {
          setError(message);
          updateToast(toastId, { message, type: "error" });
        }
        setLoading(false);
      });
  };

  const fieldError = (field) => validationErrors[field] || null;

  if (fetchLoading)
    return <div className="loading-spinner"><div className="spinner" />Načítám náklad...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Náklad</div>
          <h1 className="page-title">{isEditing ? "Upravit náklad" : "Nový náklad"}</h1>
        </div>
        <Link to="/expenses" className="btn-outline">
          <ArrowLeft size={14} /> Zpět
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Datum<span className="required-dot" />
              </label>
              <input
                className={`form-input${fieldError("date") ? " input-error input-error-pulse" : ""}`}
                type="date"
                value={expense.date}
                onChange={handleChange("date")}
                required
              />
              {fieldError("date") && <div className="field-error">{fieldError("date")}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Částka (Kč)<span className="required-dot" />
              </label>
              <input
                className={`form-input${fieldError("amount") ? " input-error input-error-pulse" : ""}`}
                type="number"
                step="0.01"
                min="0"
                value={expense.amount}
                onChange={handleChange("amount")}
                required
              />
              {fieldError("amount") && <div className="field-error">{fieldError("amount")}</div>}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">
                Popis<span className="required-dot" />
              </label>
              <input
                className={`form-input${fieldError("description") ? " input-error input-error-pulse" : ""}`}
                type="text"
                maxLength={255}
                value={expense.description}
                onChange={handleChange("description")}
                required
              />
              {fieldError("description") && <div className="field-error">{fieldError("description")}</div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? "Ukládám..." : "Uložit"}
            </button>
            <Link to="/expenses" className="btn-outline">Zrušit</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
