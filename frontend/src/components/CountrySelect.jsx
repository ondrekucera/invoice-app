import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

const COUNTRIES = [
  { value: "CZECHIA",  label: "Česká republika", keywords: ["cz", "čes", "ceska", "česká", "czech"] },
  { value: "SLOVAKIA", label: "Slovensko",        keywords: ["sk", "slov", "slovakia"] },
];

const CountrySelect = ({ value, onChange, fieldError }) => {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const ref      = useRef(null);
  const inputRef = useRef(null);

  const selected = COUNTRIES.find(c => c.value === value);

  const filtered = COUNTRIES.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      c.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
      c.keywords.some(k => k.includes(q))
    );
  });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="form-group">
      <label className="form-label">Země<span className="required-dot" /></label>
      <div className="person-select-wrap" ref={ref}>
        <button
          type="button"
          className={`person-select-trigger${open ? " open" : ""}${fieldError ? " input-error-trigger" : ""}`}
          onClick={() => setOpen(o => !o)}
        >
          <span className="person-select-value">{selected?.label ?? "— Vyberte zemi —"}</span>
          <span className="person-select-chevron"><ChevronDown size={14} /></span>
        </button>

        {open && (
          <div className="person-select-dropdown">
            <div className="person-select-search">
              <Search size={13} className="person-select-search-icon" />
              <input
                ref={inputRef}
                className="person-select-search-input"
                placeholder="Hledat zemi..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="person-select-list">
              {filtered.length === 0 ? (
                <div className="person-select-empty">Žádná země neodpovídá.</div>
              ) : (
                filtered.map(c => (
                  <div
                    key={c.value}
                    className={`person-select-option${c.value === value ? " active" : ""}`}
                    onClick={() => handleSelect(c.value)}
                  >
                    <span className="person-select-option-name">{c.label}</span>
                    {c.value === value && <span className="person-select-check"><Check size={13} /></span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {fieldError && <div className="field-error">{fieldError}</div>}
    </div>
  );
};

export default CountrySelect;
