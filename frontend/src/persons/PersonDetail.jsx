import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { apiGet, apiDelete, parseApiError, getErrorMessage } from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/ToastContext";
import { CATEGORY_LABELS } from "./constants";

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [person, setPerson]           = useState({});
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    apiGet("/api/persons/" + id)
      .then(data => { setPerson(data); setLoading(false); })
      .catch(e   => { setError(getErrorMessage(e)); setLoading(false); });
  }, [id]);

  const handleDeleteRequest  = () => setConfirmOpen(true);
  const handleCancelDelete   = () => setConfirmOpen(false);
  const handleConfirmDelete  = () => {
    setConfirmOpen(false);
    apiDelete("/api/persons/" + id)
      .then(() => {
        addToast(`Osoba ${person.name} byla smazána.`, "success");
        navigate("/persons");
      })
      .catch(e => {
        addToast(parseApiError(e).message, "error");
      });
  };

  if (loading)
    return <div className="loading-spinner"><div className="spinner" />Načítám osobu...</div>;

  if (error)
    return <div className="alert alert-danger">Chyba: {error}</div>;

  const countryLabel = person.country === "CZECHIA" ? "Česká republika" : person.country === "SLOVAKIA" ? "Slovensko" : (person.country ?? null);
  const categoryLabel = person.category ? (CATEGORY_LABELS[person.category] ?? person.category) : null;

  return (
    <>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Smazat osobu"
        message={
          <span>
            Opravdu chcete smazat osobu{" "}
            <strong style={{ color: "var(--color-text)" }}>{person.name}</strong>?
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
        confirmLabel="Smazat osobu"
        cancelLabel="Zrušit"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger
      />

      <div>
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-eyebrow">Osoba</div>
            <h1 className="page-title">{person.name}</h1>
            <div className="page-sub" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              IČO: {person.identificationNumber}
              {categoryLabel && (
                <span className="category-badge">{categoryLabel}</span>
              )}
            </div>
          </div>
          <div className="page-actions">
            <Link to="/persons" className="btn-outline">
              <ArrowLeft size={14} /> Zpět na osoby
            </Link>
            <Link to={"/persons/edit/" + id} className="btn-primary">
              <Pencil size={14} /> Upravit osobu
            </Link>
            <button
              className="btn-icon danger"
              onClick={handleDeleteRequest}
              title="Smazat osobu"
              style={{ padding: "0.5rem 0.65rem" }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="detail-grid">
            <div>
              <div className="detail-label">IČO</div>
              <div className="detail-value">{person.identificationNumber}</div>
            </div>
            <div>
              <div className="detail-label">DIČ</div>
              <div className="detail-value">{person.taxNumber || "—"}</div>
            </div>
            <div>
              <div className="detail-label">Telefon</div>
              <div className="detail-value">{person.telephone || "—"}</div>
            </div>
            <div>
              <div className="detail-label">E-mail</div>
              <div className="detail-value">{person.mail || "—"}</div>
            </div>
            <div>
              <div className="detail-label">Bankovní účet</div>
              <div className="detail-value">
                {person.accountNumber && person.bankCode
                  ? `${person.accountNumber}/${person.bankCode}`
                  : "—"}
                {person.iban && (
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", marginLeft: "0.5rem" }}>
                    ({person.iban})
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="detail-label">Sídlo</div>
              <div className="detail-value">
                {[person.street, person.city, person.zip, countryLabel].filter(Boolean).join(", ") || "—"}
              </div>
            </div>
            {categoryLabel && (
              <div>
                <div className="detail-label">Kategorie</div>
                <div className="detail-value">
                  <span className="category-badge">{categoryLabel}</span>
                </div>
              </div>
            )}
            {person.note && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="detail-label">Poznámka</div>
                <div className="detail-value" style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  {person.note}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={"/invoices/sales/" + id} className="btn-outline">
            <FileText size={14} /> Vystavené faktury
          </Link>
          <Link to={"/invoices/purchases/" + id} className="btn-outline">
            <FileText size={14} /> Přijaté faktury
          </Link>
        </div>
      </div>
    </>
  );
};

export default PersonDetail;
