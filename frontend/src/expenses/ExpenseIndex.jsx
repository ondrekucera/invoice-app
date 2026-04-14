import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiDelete, apiGet, parseApiError } from "../utils/api";
import { useToast } from "../components/ToastContext";
import ExpenseTable from "./ExpenseTable";

const ExpenseIndex = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    apiGet("/api/expenses")
      .then(data => {
        const sorted = [...data].sort((a, b) => (b._id ?? 0) - (a._id ?? 0));
        setExpenses(sorted);
        setLoading(false);
      })
      .catch(e => { setError(parseApiError(e).message); setLoading(false); });
  }, []);

  const deleteExpense = async (id) => {
    const expense = expenses.find(e => e._id === id);
    setExpenses(prev => prev.filter(item => item._id !== id));
    try {
      await apiDelete("/api/expenses/" + id);
      addToast("Náklad byl smazán.", "success");
    } catch (e) {
      setExpenses(prev => [...prev, expense].sort((a, b) => (b._id ?? 0) - (a._id ?? 0)));
      addToast(parseApiError(e).message, "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Evidence</div>
          <h1 className="page-title">Náklady</h1>
        </div>
        <div className="page-actions">
          <Link to="/expenses/create" className="btn-primary">
            <Plus size={15} /> Nový náklad
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {loading ? (
        <div>Načítání...</div>
      ) : (
        <ExpenseTable items={expenses} deleteExpense={deleteExpense} />
      )}
    </div>
  );
};

export default ExpenseIndex;
