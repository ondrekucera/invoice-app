import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut, parseApiError } from "../utils/api";
import PersonSelect from "../components/PersonSelect";
import DateInput from "../components/DateInput";
import { useToast } from "../components/ToastContext";

const InvoiceForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = !!id;
  const { addToast, updateToast } = useToast();

  const [persons, setPersons] = useState([]);
  const [invoice, setInvoice] = useState({
    invoiceNumber: "", issued: "", dueDate: "", product: "",
    price: "", vat: "", note: "",
    buyer: { _id: "" }, seller: { _id: "" },
  });
  const [loading,          setLoading]          = useState(false);
  const [fetchLoading,     setFetchLoading]     = useState(isEditing);
  const [error,            setError]            = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const fieldRefs = useRef({});
  const getRef = (name) => {
    if (!fieldRefs.current[name]) fieldRefs.current[name] = React.createRef();
    return fieldRefs.current[name];
  };

  useEffect(() => {
    apiGet("/api/persons").then(setPersons).catch(() => {});
    if (isEditing) {
      apiGet("/api/invoices/" + id)
        .then(data => {
          setInvoice({
            ...data,
            issued:  data.issued  ? data.issued.substring(0, 10)  : "",
            dueDate: data.dueDate ? data.dueDate.substring(0, 10) : "",
            buyer:  { _id: data.buyer?._id  || "" },
            seller: { _id: data.seller?._id || "" },
          });
          setFetchLoading(false);
        })
        .catch(e => { setError(parseApiError(e).message); setFetchLoading(false); });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    setInvoice(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => { const n = {...prev}; delete n[field]; return n; });
    }
  };

  const handleDateChange = (field) => (isoValue) => {
    setInvoice(prev => ({ ...prev, [field]: isoValue }));
    if (validationErrors[field]) {
      setValidationErrors(prev => { const n = {...prev}; delete n[field]; return n; });
    }
  };

  const handlePersonSelect = (role) => (personId) => {
    setInvoice(prev => ({ ...prev, [role]: { _id: personId } }));
    if (validationErrors[role]) {
      setValidationErrors(prev => { const n = {...prev}; delete n[role]; return n; });
    }
  };

  const handlePersonCreated = (created) => {
    setPersons(prev => [...prev, created]);
    addToast(`Osoba „${created.name}" byla vytvořena.`, "success");
  };

  const focusFirstError = useCallback((errors) => {
    const ORDER = ["invoiceNumber","product","issued","dueDate","price","vat","seller","buyer"];
    for (const fname of ORDER) {
      if (errors[fname]) {
        const el = fieldRefs.current[fname]?.current;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => { el.focus?.(); el.classList?.add("input-error-pulse-active"); setTimeout(() => el.classList?.remove("input-error-pulse-active"), 1200); }, 300);
        }
        break;
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const toastId = addToast(isEditing ? "Ukládám fakturu..." : "Vytvářím fakturu...", "loading");

    (isEditing ? apiPut("/api/invoices/" + id, invoice) : apiPost("/api/invoices", invoice))
      .then(() => {
        updateToast(toastId, { message: isEditing ? "Faktura byla uložena." : "Faktura byla vytvořena.", type: "success" });
        navigate("/invoices");
      })
      .catch(e => {
        const { message, validationErrors: ve } = parseApiError(e);
        if (ve) {
          setValidationErrors(ve);
          setError("Formulář obsahuje chyby. Zkontrolujte vyplněná pole.");
          updateToast(toastId, { message: "Formulář obsahuje chyby.", type: "error" });
          setTimeout(() => focusFirstError(ve), 100);
        } else {
          setError(message);
          updateToast(toastId, { message, type: "error" });
        }
        setLoading(false);
      });
  };

  const fe = (field) => validationErrors[field] || null;

  if (fetchLoading)
    return <div className="loading-spinner"><div className="spinner" />Načítám fakturu...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Faktury</div>
          <h1 className="page-title">{isEditing ? "Upravit fakturu" : "Nová faktura"}</h1>
          {isEditing && invoice.product && <div className="page-sub">{invoice.product}</div>}
        </div>
        <Link to="/invoices" className="btn-outline"><ArrowLeft size={14} /> Zpět na faktury</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section-block">
            <div className="form-section-label">📄 Základní informace</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Číslo faktury<span className="required-dot" /></label>
                <input ref={getRef("invoiceNumber")} className={`form-input${fe("invoiceNumber") ? " input-error" : ""}`}
                  type="number" placeholder="2024001" value={invoice.invoiceNumber}
                  onChange={handleChange("invoiceNumber")} min="1" />
                {fe("invoiceNumber") && <div className="field-error">{fe("invoiceNumber")}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Produkt<span className="required-dot" /></label>
                <input ref={getRef("product")} className={`form-input${fe("product") ? " input-error" : ""}`}
                  type="text" placeholder="Název produktu nebo služby" value={invoice.product}
                  onChange={handleChange("product")} />
                {fe("product") && <div className="field-error">{fe("product")}</div>}
              </div>
              <DateInput label="Datum vystavení" required value={invoice.issued}
                onChange={handleDateChange("issued")} fieldError={fe("issued")} />
              <DateInput label="Datum splatnosti" required value={invoice.dueDate}
                onChange={handleDateChange("dueDate")} fieldError={fe("dueDate")} />
              <div className="form-group">
                <label className="form-label">Cena (Kč)<span className="required-dot" /></label>
                <input ref={getRef("price")} className={`form-input${fe("price") ? " input-error" : ""}`}
                  type="number" min="0" placeholder="0" value={invoice.price}
                  onChange={handleChange("price")} />
                {fe("price") && <div className="field-error">{fe("price")}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">DPH (%)<span className="required-dot" /></label>
                <input ref={getRef("vat")} className={`form-input${fe("vat") ? " input-error" : ""}`}
                  type="number" min="0" max="100" placeholder="21" value={invoice.vat}
                  onChange={handleChange("vat")} />
                {fe("vat") && <div className="field-error">{fe("vat")}</div>}
              </div>
            </div>
          </div>

          <div className="form-section-block">
            <div className="form-section-label">🤝 Smluvní strany</div>
            <div className="form-grid">
              <PersonSelect label={<>Dodavatel (prodávající)<span className="required-dot" /></>}
                persons={persons} value={invoice.seller._id} onChange={handlePersonSelect("seller")}
                placeholder="— Vyberte dodavatele —" onPersonCreated={handlePersonCreated} fieldError={fe("seller")} />
              <PersonSelect label={<>Odběratel (kupující)<span className="required-dot" /></>}
                persons={persons} value={invoice.buyer._id} onChange={handlePersonSelect("buyer")}
                placeholder="— Vyberte odběratele —" onPersonCreated={handlePersonCreated} fieldError={fe("buyer")} />
            </div>
          </div>

          <div className="form-section-block form-section-block-last">
            <div className="form-section-label">📝 Doplňující informace</div>
            <div className="form-group">
              <label className="form-label">Poznámka</label>
              <textarea className="form-input" rows={3} style={{ resize: "vertical" }}
                placeholder="Nepovinná poznámka k faktuře..." value={invoice.note || ""}
                onChange={handleChange("note")} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? "Ukládám..." : (isEditing ? "Uložit změny" : "Vytvořit fakturu")}
            </button>
            <Link to="/invoices" className="btn-outline">Zrušit</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
