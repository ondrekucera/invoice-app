import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut, parseApiError } from "../utils/api";
import { useFieldRefs } from "../components/useFieldRefs";
import PersonSelect from "../components/PersonSelect";
import DateInput from "../components/DateInput";
import { useToast } from "../components/ToastContext";

// Pořadí polí pro přesun focusu na první chybné pole po odeslání formuláře
const FIELD_FOCUS_ORDER = ["invoiceNumber", "product", "issued", "dueDate", "price", "vat", "seller", "buyer"];

const InvoiceForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { addToast, updateToast } = useToast();
  const { fieldRefs, getRef } = useFieldRefs();

  const [persons, setPersons] = useState([]);
  const [invoice, setInvoice] = useState({
    invoiceNumber: "", issued: "", dueDate: "", product: "",
    price: "", vat: "", note: "",
    buyer: { _id: "" }, seller: { _id: "" },
  });
  const [loading,          setLoading]          = useState(false);
  const [fetchLoading,     setFetchLoading]     = useState(!!id);
  const [error,            setError]            = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Načteme osoby pro selecty – chybu tiše ignorujeme, PersonSelect má vlastní fallback
    apiGet("/api/persons").then(setPersons).catch(() => {});

    if (id) {
      apiGet("/api/invoices/" + id)
        .then(data => {
          setInvoice({
            ...data,
            // Backend vrací LocalDate jako ISO string – bereme pouze datum (prvních 10 znaků)
            issued:  data.issued  ? data.issued.substring(0, 10)  : "",
            dueDate: data.dueDate ? data.dueDate.substring(0, 10) : "",
            // Pro selecty potřebujeme pouze _id osoby, ne celý PersonDTO
            buyer:   { _id: data.buyer?._id  || "" },
            seller:  { _id: data.seller?._id || "" },
          });
          setFetchLoading(false);
        })
        .catch(e => { setError(parseApiError(e).message); setFetchLoading(false); });
    } else {
      // Nová faktura – navrhneme další volné číslo faktury
      // Načteme všechny faktury a vezmeme max(invoiceNumber) + 1
      apiGet("/api/invoices", { limit: 1000 })
        .then(data => {
          const maxNum = data.reduce((max, inv) => Math.max(max, inv.invoiceNumber || 0), 0);
          const nextNumber = maxNum + 1;
          setInvoice(prev => ({ ...prev, invoiceNumber: String(nextNumber) }));
        })
        .catch(() => {
          // Fallback: použijeme rok + 001 formát
          const fallback = new Date().getFullYear() * 1000 + 1;
          setInvoice(prev => ({ ...prev, invoiceNumber: String(fallback) }));
        });
    }
  }, [id]);

  // Vymaže chybu konkrétního pole hned při editaci – UI okamžitě reaguje
  const clearFieldError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleChange = (field) => (e) => {
    setInvoice(prev => ({ ...prev, [field]: e.target.value }));
    clearFieldError(field);
  };

  const handleDateChange = (field) => (isoValue) => {
    setInvoice(prev => ({ ...prev, [field]: isoValue }));
    clearFieldError(field);
  };

  const handlePersonSelect = (role) => (personId) => {
    setInvoice(prev => ({ ...prev, [role]: { _id: personId } }));
    clearFieldError(role);
  };

  const handlePersonCreated = (created) => {
    // Přidáme nově vytvořenou osobu do lokálního seznamu bez nového API volání
    setPersons(prev => [...prev, created]);
    addToast(`Osoba „${created.name}" byla vytvořena.`, "success");
  };

  const focusFirstError = useCallback((errors) => {
    for (const fieldName of FIELD_FOCUS_ORDER) {
      if (!errors[fieldName]) continue;
      const el = fieldRefs.current[fieldName]?.current;
      if (!el) break;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        el.focus?.();
        // CSS animace pulzu zvýrazní chybné pole vizuálně
        el.classList?.add("input-error-pulse-active");
        setTimeout(() => el.classList?.remove("input-error-pulse-active"), 1200);
      }, 300);
      break;
    }
  }, [fieldRefs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setValidationErrors({});

    const toastId = addToast(
      id ? "Ukládám fakturu..." : "Vytvářím fakturu...",
      "loading"
    );

    const request = id
      ? apiPut("/api/invoices/" + id, invoice)
      : apiPost("/api/invoices", invoice);

    request
      .then(() => {
        updateToast(toastId, {
          message: id ? "Faktura byla uložena." : "Faktura byla vytvořena.",
          type:    "success",
        });
        navigate("/invoices");
      })
      .catch(e => {
        const { message, validationErrors: ve } = parseApiError(e);
        if (ve) {
          // Backend vrátil mapu chyb polí (HTTP 400) – zobrazíme inline
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
    return <div className="loading-spinner"><div className="spinner" />Načítám fakturu...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Faktury</div>
          <h1 className="page-title">{id ? "Upravit fakturu" : "Nová faktura"}</h1>
          {id && invoice.product && <div className="page-sub">{invoice.product}</div>}
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
                <input
                  ref={getRef("invoiceNumber")}
                  className={`form-input input-no-spinner${fieldError("invoiceNumber") ? " input-error" : ""}`}
                  type="number" placeholder="2024001"
                  value={invoice.invoiceNumber}
                  onChange={handleChange("invoiceNumber")}
                  min="1"
                />
                {fieldError("invoiceNumber") && <div className="field-error">{fieldError("invoiceNumber")}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Produkt<span className="required-dot" /></label>
                <input
                  ref={getRef("product")}
                  className={`form-input${fieldError("product") ? " input-error" : ""}`}
                  type="text" placeholder="Název produktu nebo služby"
                  value={invoice.product}
                  onChange={handleChange("product")}
                />
                {fieldError("product") && <div className="field-error">{fieldError("product")}</div>}
              </div>

              <DateInput
                label="Datum vystavení" required
                value={invoice.issued}
                onChange={handleDateChange("issued")}
                fieldError={fieldError("issued")}
              />
              <DateInput
                label="Datum splatnosti" required
                value={invoice.dueDate}
                onChange={handleDateChange("dueDate")}
                fieldError={fieldError("dueDate")}
              />

              <div className="form-group">
                <label className="form-label">Cena (Kč)<span className="required-dot" /></label>
                <input
                  ref={getRef("price")}
                  className={`form-input input-no-spinner${fieldError("price") ? " input-error" : ""}`}
                  type="number" min="0" placeholder="0"
                  value={invoice.price}
                  onChange={handleChange("price")}
                />
                {fieldError("price") && <div className="field-error">{fieldError("price")}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">DPH (%)<span className="required-dot" /></label>
                <input
                  ref={getRef("vat")}
                  className={`form-input input-no-spinner${fieldError("vat") ? " input-error" : ""}`}
                  type="number" min="0" max="100" placeholder="21"
                  value={invoice.vat}
                  onChange={handleChange("vat")}
                />
                {fieldError("vat") && <div className="field-error">{fieldError("vat")}</div>}
              </div>
            </div>
          </div>

          <div className="form-section-block">
            <div className="form-section-label">🤝 Smluvní strany</div>
            <div className="form-grid">
              <PersonSelect
                label={<>Dodavatel (prodávající)<span className="required-dot" /></>}
                persons={persons}
                value={invoice.seller._id}
                onChange={handlePersonSelect("seller")}
                placeholder="— Vyberte dodavatele —"
                onPersonCreated={handlePersonCreated}
                fieldError={fieldError("seller")}
              />
              <PersonSelect
                label={<>Odběratel (kupující)<span className="required-dot" /></>}
                persons={persons}
                value={invoice.buyer._id}
                onChange={handlePersonSelect("buyer")}
                placeholder="— Vyberte odběratele —"
                onPersonCreated={handlePersonCreated}
                fieldError={fieldError("buyer")}
              />
            </div>
          </div>

          <div className="form-section-block form-section-block-last">
            <div className="form-section-label">📝 Doplňující informace</div>
            <div className="form-group">
              <label className="form-label">Poznámka</label>
              <textarea
                className="form-input" rows={3} style={{ resize: "vertical" }}
                placeholder="Nepovinná poznámka k faktuře..."
                value={invoice.note || ""}
                onChange={handleChange("note")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? "Ukládám..." : (id ? "Uložit změny" : "Vytvořit fakturu")}
            </button>
            <Link to="/invoices" className="btn-outline">Zrušit</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
