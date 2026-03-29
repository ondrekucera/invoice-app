import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut, parseApiError } from "../utils/api";
import { useFieldRefs } from "../components/useFieldRefs";
import CountrySelect from "../components/CountrySelect";
import { useToast } from "../components/ToastContext";

/** Maps category enum values to Czech labels for the select dropdown. */
export const CATEGORY_LABELS = {
  IT:        "IT",
  MARKETING: "Marketing",
  ZBOZI:     "Zboží",
  VOZIDLA:   "Vozidla",
  OSTATNI:   "Ostatní",
};

const FIELD_FOCUS_ORDER = [
  "name", "identificationNumber", "taxNumber", "accountNumber",
  "bankCode", "iban", "telephone", "mail", "street", "city", "zip", "country",
];

/**
 * Reusable labeled text input for person form fields.
 * Defined outside the component to avoid re-mounting on each render.
 */
const Field = ({ label, required, placeholder, type = "text", value, onChange, fieldError, fieldRef }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span className="required-dot" />}
    </label>
    <input
      ref={fieldRef}
      className={`form-input${fieldError ? " input-error input-error-pulse" : ""}`}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
    {fieldError && <div className="field-error">{fieldError}</div>}
  </div>
);

const PersonForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = !!id;
  const { addToast, updateToast } = useToast();
  const { fieldRefs, getRef } = useFieldRefs();

  const [person, setPerson] = useState({
    name: "", identificationNumber: "", taxNumber: "",
    accountNumber: "", bankCode: "", iban: "",
    telephone: "", mail: "",
    street: "", zip: "", city: "",
    country: "CZECHIA",
    note: "",
    category: "",
  });
  const [loading,          setLoading]          = useState(false);
  const [fetchLoading,     setFetchLoading]     = useState(isEditing);
  const [error,            setError]            = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) {
      apiGet("/api/persons/" + id)
        .then(data => {
          // Backend může vracet category: null – pro select potřebujeme prázdný string
          setPerson({ ...data, category: data.category ?? "" });
          setFetchLoading(false);
        })
        .catch(e => { setError(parseApiError(e).message); setFetchLoading(false); });
    }
  }, [id]);

  // Vymaže chybu konkrétního pole hned při editaci – UI okamžitě reaguje
  const clearFieldError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleChange = (field) => (e) => {
    setPerson(prev => ({ ...prev, [field]: e.target.value }));
    clearFieldError(field);
  };

  const handleCountryChange = (val) => setPerson(prev => ({ ...prev, country: val }));

  const focusFirstError = useCallback((errors) => {
    for (const fieldName of FIELD_FOCUS_ORDER) {
      if (!errors[fieldName]) continue;
      const el = fieldRefs.current[fieldName]?.current;
      if (!el) break;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus?.(), 300);
      break;
    }
  }, [fieldRefs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setValidationErrors({});

    // Prázdný string z selectu posíláme jako null – backend odmítá prázdný enum string
    const payload = { ...person, category: person.category || null };

    const toastId = addToast(
      isEditing ? "Ukládám osobu..." : "Vytvářím osobu...",
      "loading"
    );

    (id ? apiPut("/api/persons/" + id, payload) : apiPost("/api/persons", payload))
      .then(() => {
        updateToast(toastId, {
          message: isEditing ? "Osoba byla uložena." : "Osoba byla vytvořena.",
          type:    "success",
        });
        navigate("/persons");
      })
      .catch(e => {
        const { message, validationErrors: ve } = parseApiError(e);
        if (ve) {
          // Backend vrátil mapu chyb polí (HTTP 400) – zobrazíme inline u každého pole
          setValidationErrors(ve);
          setError("Formulář obsahuje chyby. Zkontrolujte vyplněná pole.");
          updateToast(toastId, { message: "Formulář obsahuje chyby.", type: "error" });
          setTimeout(() => focusFirstError(ve), 100);
        } else {
          // Business chyba (HTTP 422) nebo síťová chyba – zobrazíme obecnou zprávu
          setError(message);
          updateToast(toastId, { message, type: "error" });
        }
        setLoading(false);
      });
  };

  const fieldError = (field) => validationErrors[field] || null;

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
        <form onSubmit={handleSubmit} noValidate>

          <div className="form-section-block">
            <div className="form-section-label">🏢 Základní údaje</div>
            <div className="form-grid">
              <Field label="Jméno / Firma" required placeholder="Název firmy nebo jméno"
                value={person.name} onChange={handleChange("name")}
                fieldError={fieldError("name")} fieldRef={getRef("name")} />
              <Field label="IČO" required placeholder="12345678"
                value={person.identificationNumber} onChange={handleChange("identificationNumber")}
                fieldError={fieldError("identificationNumber")} fieldRef={getRef("identificationNumber")} />
              <Field label="DIČ" placeholder="CZ12345678"
                value={person.taxNumber || ""} onChange={handleChange("taxNumber")}
                fieldError={fieldError("taxNumber")} fieldRef={getRef("taxNumber")} />
              <div className="form-group">
                <label className="form-label">Kategorie</label>
                <select
                  className="form-input"
                  value={person.category || ""}
                  onChange={handleChange("category")}
                >
                  <option value="">— Bez kategorie —</option>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section-block">
            <div className="form-section-label">🏦 Bankovní údaje</div>
            <div className="form-grid">
              <Field label="Číslo účtu" placeholder="123456789"
                value={person.accountNumber || ""} onChange={handleChange("accountNumber")}
                fieldError={fieldError("accountNumber")} fieldRef={getRef("accountNumber")} />
              <Field label="Kód banky" placeholder="0300"
                value={person.bankCode || ""} onChange={handleChange("bankCode")}
                fieldError={fieldError("bankCode")} fieldRef={getRef("bankCode")} />
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="IBAN" placeholder="CZ6508000000192000145399"
                  value={person.iban || ""} onChange={handleChange("iban")}
                  fieldError={fieldError("iban")} fieldRef={getRef("iban")} />
              </div>
            </div>
          </div>

          <div className="form-section-block">
            <div className="form-section-label">📞 Kontakt</div>
            <div className="form-grid">
              <Field label="Telefon" placeholder="+420 123 456 789"
                value={person.telephone || ""} onChange={handleChange("telephone")}
                fieldError={fieldError("telephone")} fieldRef={getRef("telephone")} />
              <Field label="E-mail" type="email" placeholder="info@firma.cz"
                value={person.mail || ""} onChange={handleChange("mail")}
                fieldError={fieldError("mail")} fieldRef={getRef("mail")} />
            </div>
          </div>

          <div className="form-section-block">
            <div className="form-section-label">📍 Adresa</div>
            <div className="form-grid">
              <Field label="Ulice" placeholder="Náměstí míru 1"
                value={person.street || ""} onChange={handleChange("street")}
                fieldError={fieldError("street")} fieldRef={getRef("street")} />
              <Field label="Město" placeholder="Praha"
                value={person.city || ""} onChange={handleChange("city")}
                fieldError={fieldError("city")} fieldRef={getRef("city")} />
              <Field label="PSČ" placeholder="110 00"
                value={person.zip || ""} onChange={handleChange("zip")}
                fieldError={fieldError("zip")} fieldRef={getRef("zip")} />
              <CountrySelect
                value={person.country}
                onChange={handleCountryChange}
                fieldError={fieldError("country")}
              />
            </div>
          </div>

          <div className="form-section-block form-section-block-last">
            <div className="form-section-label">📝 Poznámka</div>
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
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? "Ukládám..." : (isEditing ? "Uložit osobu" : "Vytvořit osobu")}
            </button>
            <Link to="/persons" className="btn-outline">Zrušit</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonForm;
