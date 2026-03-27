import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { apiGet, apiDelete } from "../utils/api";
import Country from "./Country";

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    apiGet("/api/persons/" + id)
      .then(data => { setPerson(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  }, [id]);

  const handleDelete = () => {
    if (window.confirm(`Opravdu chcete smazat osobu ${person.name}?`)) {
      apiDelete("/api/persons/" + id)
        .then(() => navigate("/persons"))
        .catch(e => alert("Chyba: " + e.message));
    }
  };

  if (loading)
    return <div className="loading-spinner"><div className="spinner" />Načítám osobu...</div>;

  if (error)
    return <div className="alert alert-danger">Chyba: {error}</div>;

  const country = Country.CZECHIA === person.country ? "Česká republika" : "Slovensko";

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Osoba</div>
          <h1 className="page-title">{person.name}</h1>
          <div className="page-sub">IČO: {person.identificationNumber}</div>
        </div>
        <div className="page-actions">
          <Link to="/persons" className="btn-outline">
            <ArrowLeft size={14} /> Zpět
          </Link>
          <Link to={"/persons/edit/" + id} className="btn-primary">
            <Pencil size={14} /> Upravit
          </Link>
          <button className="btn-icon danger" onClick={handleDelete}
            title="Smazat" style={{ padding: "0.5rem 0.65rem" }}>
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
              {[person.street, person.city, person.zip, country].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
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
  );
};

export default PersonDetail;
