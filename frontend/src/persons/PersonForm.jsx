import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut } from "../utils/api";
import Country from "./Country";

/* ─────────────────────────────────────────────────────────────
   DŮLEŽITÉ: Field musí být definován MIMO PersonForm komponent,
   jinak React při každém re-renderu vytvoří nový typ komponenty
   → unmount + mount → ztráta focusu při psaní.
   ───────────────────────────────────────────────────────────── */
const Field = ({ label, required, placeholder, type = "text", value, onChange }) => (
  <div className="form-group">
    <label className="form-label">{label}{required ? " *" : ""}</label>
    <input
      className="form-input"
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const PersonForm = () => {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEditing  = !!id;

  const [person, setPerson] = useState({
    name: "",
    identificationNumber: "",
    taxNumber: "",
    accountNumber: "",
    bankCode: "",
    iban: "",
    telephone: "",
    mail: "",
    street: "",
    zip: "",
    city: "",
    country: Country.CZECHIA,
    note: "",
  });
  const [loading,      setLoading]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (id) {
      apiGet("/api/persons/" + id)
        .then(data  => { setPerson(data); setFetchLoading(false); })
        .catch(e    => { setError(e.message); setFetchLoading(false); });
    }
  }, [id]);

  /* Stabilní onChange handlery – používáme funkční update, aby closure nevyžadovala
     aktuální person v závilosti (jinak by se handler znovu vytváře při každém renderu) */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setPerson(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    (id ? apiPut("/api/persons/" + id, person) : apiPost("/api/persons", person))
      .then(() => navigate("/persons"))
      .catch(e => { setError(e.message); setLoading(false); });
  };

  if (fetchLoading)
    return <div className="loading-spinner"><div className="spinner" />Načítám osobu...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Osoba</div>
          <h1 className="page-title">{isEditing ? "Upravit osobu" : "Nová osoba"}</h1>
        </div>
        <Link to="/persons" className="btn-outline">
          <ArrowLeft size={14} /> Zpět
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          {/* Základní */}
          <div className="form-section-label">Základní údaje</div>
          <div className="form-grid">
            <Field
              label="Jméno / Firma" required
              placeholder="Název firmy nebo jméno"
              value={person.name}
              onChange={handleChange("name")}
            />
            <Field
              label="IČO" required
              placeholder="12345678"
              value={person.identificationNumber}
              onChange={handleChange("identificationNumber")}
            />
            <Field
              label="DIČ"
              placeholder="CZ12345678"
              value={person.taxNumber}
              onChange={handleChange("taxNumber")}
            />
          </div>

          {/* Bankovní */}
          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Bankovní údaje</div>
          <div className="form-grid">
            <Field
              label="Číslo účtu"
              placeholder="123456789"
              value={person.accountNumber}
              onChange={handleChange("accountNumber")}
            />
            <Field
              label="Kód banky"
              placeholder="0300"
              value={person.bankCode}
              onChange={handleChange("bankCode")}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="IBAN"
                placeholder="CZ6508000000192000145399"
                value={person.iban}
                onChange={handleChange("iban")}
              />
            </div>
          </div>

          {/* Kontakt */}
          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Kontakt</div>
          <div className="form-grid">
            <Field
              label="Telefon" required
              placeholder="+420 123 456 789"
              value={person.telephone}
              onChange={handleChange("telephone")}
            />
            <Field
              label="E-mail" required type="email"
              placeholder="info@firma.cz"
              value={person.mail}
              onChange={handleChange("mail")}
            />
          </div>

          {/* Adresa */}
          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Adresa</div>
          <div className="form-grid">
            <Field
              label="Ulice" required
              placeholder="Náměstí míru 1"
              value={person.street}
              onChange={handleChange("street")}
            />
            <Field
              label="Město" required
              placeholder="Praha"
              value={person.city}
              onChange={handleChange("city")}
            />
            <Field
              label="PSČ" required
              placeholder="110 00"
              value={person.zip}
              onChange={handleChange("zip")}
            />
          </div>

          {/* Země */}
          <div className="form-group" style={{ marginTop: "0.5rem" }}>
            <label className="form-label">Země *</label>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
              {[
                { value: Country.CZECHIA,  label: "Česká republika" },
                { value: Country.SLOVAKIA, label: "Slovensko" },
              ].map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="country"
                    value={opt.value}
                    checked={person.country === opt.value}
                    onChange={handleChange("country")}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Poznámka */}
          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Poznámka</div>
          <div className="form-group">
            <textarea
              className="form-input"
              rows={2}
              style={{ resize: "vertical" }}
              placeholder="Nepovinná poznámka..."
              value={person.note || ""}
              onChange={handleChange("note")}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? "Ukládám..." : "Uložit osobu"}
            </button>
            <Link to="/persons" className="btn-outline">Zrušit</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonForm;
