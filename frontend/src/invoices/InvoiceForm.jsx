import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { apiGet, apiPost, apiPut } from "../utils/api";

const InvoiceForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = !!id;

  const [persons, setPersons] = useState([]);
  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    issued: "",
    dueDate: "",
    product: "",
    price: "",
    vat: "",
    note: "",
    buyer:  { _id: "" },
    seller: { _id: "" },
  });
  const [loading,      setLoading]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    apiGet("/api/persons").then(setPersons);
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
        .catch(e => { setError(e.message); setFetchLoading(false); });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonChange = (role) => (e) => {
    const value = e.target.value;
    setInvoice(prev => ({ ...prev, [role]: { _id: value } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    (isEditing ? apiPut("/api/invoices/" + id, invoice) : apiPost("/api/invoices", invoice))
      .then(() => navigate("/invoices"))
      .catch(e => { setError(e.message); setLoading(false); });
  };

  if (fetchLoading)
    return <div className="loading-spinner"><div className="spinner" />Načítám fakturu...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Faktury</div>
          <h1 className="page-title">{isEditing ? "Upravit fakturu" : "Nová faktura"}</h1>
          {isEditing && invoice.product && (
            <div className="page-sub">{invoice.product}</div>
          )}
        </div>
        <Link to="/invoices" className="btn-outline">
          <ArrowLeft size={14} /> Zpět na faktury
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section-label">Základní informace</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Číslo faktury *</label>
              <input
                className="form-input"
                type="number"
                required
                placeholder="2024001"
                value={invoice.invoiceNumber}
                onChange={handleChange("invoiceNumber")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Produkt *</label>
              <input
                className="form-input"
                type="text"
                required
                placeholder="Název produktu nebo služby"
                value={invoice.product}
                onChange={handleChange("product")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Datum vystavení *</label>
              <input
                className="form-input"
                type="date"
                required
                value={invoice.issued}
                onChange={handleChange("issued")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Datum splatnosti *</label>
              <input
                className="form-input"
                type="date"
                required
                value={invoice.dueDate}
                onChange={handleChange("dueDate")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cena (Kč) *</label>
              <input
                className="form-input"
                type="number"
                required
                min="0"
                placeholder="0"
                value={invoice.price}
                onChange={handleChange("price")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">DPH (%) *</label>
              <input
                className="form-input"
                type="number"
                required
                min="0"
                max="100"
                placeholder="21"
                value={invoice.vat}
                onChange={handleChange("vat")}
              />
            </div>
          </div>

          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Smluvní strany</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Dodavatel (prodávající) *</label>
              <select
                className="form-input"
                required
                value={invoice.seller._id}
                onChange={handlePersonChange("seller")}
              >
                <option value="">— Vyberte dodavatele —</option>
                {persons.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Odběratel (kupující) *</label>
              <select
                className="form-input"
                required
                value={invoice.buyer._id}
                onChange={handlePersonChange("buyer")}
              >
                <option value="">— Vyberte odběratele —</option>
                {persons.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section-label" style={{ marginTop: "0.75rem" }}>Doplňující informace</div>
          <div className="form-group">
            <label className="form-label">Poznámka</label>
            <textarea
              className="form-input"
              rows={3}
              style={{ resize: "vertical" }}
              placeholder="Nepovinná poznámka k faktuře..."
              value={invoice.note || ""}
              onChange={handleChange("note")}
            />
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
