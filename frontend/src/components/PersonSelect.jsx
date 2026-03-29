import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Check, Search, X, Plus, Save } from "lucide-react";
import { apiPost } from "../utils/api";
import Country from "../persons/Country";

// Inline formulář v modalu – pole mimo komponentu kvůli stabilitě focusu
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

const EMPTY_PERSON = {
  name: "", identificationNumber: "", taxNumber: "",
  accountNumber: "", bankCode: "", iban: "",
  telephone: "", mail: "", street: "", zip: "", city: "",
  country: Country.CZECHIA, note: "", category: null,
};

const PersonSelect = ({ label, persons, value, onChange, placeholder, onPersonCreated, fieldError }) => {
  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [newPerson,   setNewPerson]   = useState(EMPTY_PERSON);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  const wrapRef    = useRef(null);
  const searchRef  = useRef(null);

  const selected = persons.find(p => String(p._id) === String(value));

  // Filtrování podle jména nebo IČO (s debounce zpožděním)
  const filtered = persons.filter(p => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (p.name || "").toLowerCase().includes(q) ||
           (p.identificationNumber || "").includes(q);
  });

  // Zavření po kliknutí mimo dropdown (ale ne mimo modal)
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input při otevření
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open]);

  // Debounce: filtr se aplikuje 300ms po posledním stisku klávesy
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Zavření modalu přes Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => { if (e.key === "Escape") handleCloseModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setOpen(false);
    setSearch("");
    setNewPerson(EMPTY_PERSON);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSaveError(null);
  };

  const handlePersonChange = (field) => (e) => {
    setNewPerson(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreatePerson = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    apiPost("/api/persons", newPerson)
      .then(created => {
        if (onPersonCreated) onPersonCreated(created);
        onChange(created._id);
        setModalOpen(false);
        setSaving(false);
      })
      .catch(err => {
        setSaveError(err.message);
        setSaving(false);
      });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="person-select-wrap" ref={wrapRef}>
          {/* Trigger tlačítko */}
          <button
            type="button"
            className={`person-select-trigger${open ? " open" : ""}${!selected ? " placeholder" : ""}${fieldError ? " input-error-trigger" : ""}`}
            onClick={() => setOpen(o => !o)}
          >
            <span className="person-select-icon"><User size={14} /></span>
            <span className="person-select-value">
              {selected ? selected.name : (placeholder || "— Vyberte osobu —")}
            </span>
            <span className="person-select-chevron"><ChevronDown size={14} /></span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="person-select-dropdown">
              {/* Vyhledávání */}
              <div className="person-select-search">
                <Search size={13} className="person-select-search-icon" />
                <input
                  ref={searchRef}
                  className="person-select-search-input"
                  placeholder="Hledat osobu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                {search && (
                  <button type="button" className="person-select-search-clear" onClick={() => setSearch("")}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Seznam */}
              <div className="person-select-list">
                {filtered.length === 0 ? (
                  <div className="person-select-empty">Žádná osoba neodpovídá.</div>
                ) : (
                  filtered.map(p => (
                    <div
                      key={p._id}
                      className={`person-select-option${String(p._id) === String(value) ? " active" : ""}`}
                      onClick={() => handleSelect(p._id)}
                    >
                      <span className="person-select-option-name">{p.name}</span>
                      {p.identificationNumber && (
                        <span className="person-select-option-ico">IČO: {p.identificationNumber}</span>
                      )}
                      {String(p._id) === String(value) && (
                        <span className="person-select-check"><Check size={13} /></span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Vytvoření nové osoby */}
              <div className="person-select-create" onClick={handleOpenModal}>
                <Plus size={13} />
                <span>Vytvořit novou osobu</span>
              </div>
            </div>
          )}
        </div>
      {fieldError && <div className="field-error">{fieldError}</div>}
      </div>

      {/* Modal pro vytvoření osoby */}
      {modalOpen && (
        <div className="confirm-modal-overlay" onClick={handleCloseModal}>
          <div
            className="confirm-modal person-create-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 560 }}
          >
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-wrap" style={{ background: "rgba(124,58,237,0.12)" }}>
                <User size={18} style={{ color: "var(--color-primary)" }} />
              </div>
              <div className="confirm-modal-title">Nová osoba</div>
              <button className="confirm-modal-close" onClick={handleCloseModal}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreatePerson}>
              <div className="confirm-modal-body" style={{ paddingTop: "0.75rem" }}>
                {saveError && <div className="alert alert-danger" style={{ marginBottom: "0.75rem" }}>{saveError}</div>}
                <div className="form-section-label">Základní údaje</div>
                <div className="form-grid">
                  <Field label="Jméno / Firma" required placeholder="Název firmy nebo jméno"
                    value={newPerson.name} onChange={handlePersonChange("name")} />
                  <Field label="IČO" required placeholder="12345678"
                    value={newPerson.identificationNumber} onChange={handlePersonChange("identificationNumber")} />
                </div>
                <div className="form-section-label" style={{ marginTop: "0.5rem" }}>Kontakt</div>
                <div className="form-grid">
                  <Field label="Telefon" required placeholder="+420 123 456 789"
                    value={newPerson.telephone} onChange={handlePersonChange("telephone")} />
                  <Field label="E-mail" required type="email" placeholder="info@firma.cz"
                    value={newPerson.mail} onChange={handlePersonChange("mail")} />
                </div>
                <div className="form-section-label" style={{ marginTop: "0.5rem" }}>Adresa</div>
                <div className="form-grid">
                  <Field label="Ulice" required placeholder="Náměstí míru 1"
                    value={newPerson.street} onChange={handlePersonChange("street")} />
                  <Field label="Město" required placeholder="Praha"
                    value={newPerson.city} onChange={handlePersonChange("city")} />
                  <Field label="PSČ" required placeholder="110 00"
                    value={newPerson.zip} onChange={handlePersonChange("zip")} />
                </div>
              </div>

              <div className="confirm-modal-footer">
                <button type="button" className="btn-outline" onClick={handleCloseModal}>Zrušit</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={14} /> {saving ? "Ukládám..." : "Vytvořit osobu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonSelect;
