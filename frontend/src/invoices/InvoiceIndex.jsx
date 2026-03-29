import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, X, Plus, User, Download } from "lucide-react";
import { apiGet, getErrorMessage } from "../utils/api";
import InvoiceTable from "./InvoiceTable";
import Pagination from "../components/Pagination";
import { usePagination } from "../components/usePagination";
import SkeletonList from "../components/SkeletonList";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const TABS = [
  { key: "all",       label: "Všechny" },
  { key: "sales",     label: "Vystavené" },
  { key: "purchases", label: "Přijaté" },
];

const EMPTY_FILTERS = {
  product:    "",
  minPrice:   "",
  maxPrice:   "",
  issuedFrom: "",
  issuedTo:   "",
  dueFrom:    "",
  dueTo:      "",
  overdue:    false,
};

const PAGE_TITLE_BY_TYPE = {
  sales:     "Vystavené faktury",
  purchases: "Přijaté faktury",
};

const InvoiceIndex = ({ type }) => {
  const { personId: urlPersonId } = useParams();

  const [persons,        setPersons]        = useState([]);
  const [personSearch,   setPersonSearch]   = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null); // {_id, name}
  const [activeTab,      setActiveTab]      = useState("all");
  const [invoices,       setInvoices]       = useState([]);
  const [invoiceSearch,  setInvoiceSearch]  = useState(""); // klientský search pro sales/purchases
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [filters,        setFilters]        = useState(EMPTY_FILTERS);
  const [personsOpen,    setPersonsOpen]    = useState(false);
  const personSearchRef  = useRef(null);
  const personDropRef    = useRef(null);

  const isPersonContext   = !!urlPersonId;
  const effectivePersonId = isPersonContext ? urlPersonId : selectedPerson?._id ?? "";
  const needsPersonTab    = (tab) => tab === "sales" || tab === "purchases";

  const pageTitle   = PAGE_TITLE_BY_TYPE[type] ?? "Faktury";
  const pageEyebrow = isPersonContext
    ? "Osoba"
    : (type === "sales" || type === "purchases") ? "Faktury · Osoba" : "Evidence";

  // Filtrované osoby pro dropdown vyhledávání
  const filteredPersons = personSearch.trim()
    ? persons.filter(p =>
        p.name?.toLowerCase().includes(personSearch.toLowerCase()) ||
        p.identificationNumber?.includes(personSearch)
      )
    : persons;

  // Klientský filter pro faktury v sales/purchases záložkách
  const filteredInvoices = invoiceSearch.trim()
    ? invoices.filter(inv => {
        const q = invoiceSearch.toLowerCase();
        return (
          String(inv.invoiceNumber).includes(q) ||
          inv.product?.toLowerCase().includes(q) ||
          inv.seller?.name?.toLowerCase().includes(q) ||
          inv.buyer?.name?.toLowerCase().includes(q) ||
          inv.seller?.identificationNumber?.includes(q) ||
          inv.buyer?.identificationNumber?.includes(q)
        );
      })
    : invoices;

  const resetKey = `${activeTab}|${effectivePersonId}|${JSON.stringify(filters)}|${invoiceSearch}`;
  const { page, pageSize, setPage, setPageSize, paginated, total } =
    usePagination(filteredInvoices, resetKey);

  useEffect(() => {
    if (!isPersonContext) {
      apiGet("/api/persons").then(setPersons).catch(() => {});
    }
  }, [isPersonContext]);

  // Zavřít person dropdown při kliknutí mimo
  useEffect(() => {
    if (!personsOpen) return;
    const handler = (e) => {
      if (
        personSearchRef.current && !personSearchRef.current.closest(".person-search-wrap")?.contains(e.target) &&
        personDropRef.current && !personDropRef.current.contains(e.target)
      ) {
        setPersonsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [personsOpen]);

  const loadInvoices = useCallback((tab, personId, activeFilters) => {
    setLoading(true);
    setError(null);

    const resolveUrl = () => {
      if (isPersonContext) {
        return type === "sales"
          ? `/api/invoices/sales/${urlPersonId}`
          : `/api/invoices/purchases/${urlPersonId}`;
      }
      if (tab === "sales" || tab === "purchases") {
        if (!personId) return null;
        return tab === "sales"
          ? `/api/invoices/sales/${personId}`
          : `/api/invoices/purchases/${personId}`;
      }
      return null; // "all" tab uses params
    };

    const url = resolveUrl();

    if (tab !== "all" && !url) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    if (url) {
      apiGet(url)
        .then(data => { setInvoices(data); setLoading(false); })
        .catch(e   => { setError(getErrorMessage(e)); setLoading(false); });
      return;
    }

    // "all" tab – předáváme filtry jako query params na backend
    const params = {};
    if (activeFilters.product)    params.product    = activeFilters.product;
    if (activeFilters.minPrice)   params.minPrice   = activeFilters.minPrice;
    if (activeFilters.maxPrice)   params.maxPrice   = activeFilters.maxPrice;
    if (activeFilters.issuedFrom) params.issuedFrom = activeFilters.issuedFrom;
    if (activeFilters.issuedTo)   params.issuedTo   = activeFilters.issuedTo;
    if (activeFilters.dueFrom)    params.dueFrom    = activeFilters.dueFrom;
    if (activeFilters.dueTo)      params.dueTo      = activeFilters.dueTo;
    if (activeFilters.overdue)    params.overdue    = true;

    apiGet("/api/invoices", params)
      .then(data => { setInvoices(data); setLoading(false); })
      .catch(e   => { setError(getErrorMessage(e)); setLoading(false); });
  }, [isPersonContext, type, urlPersonId]);

  useEffect(() => {
    loadInvoices(activeTab, effectivePersonId, filters);
  }, [activeTab, effectivePersonId, filters, loadInvoices]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(EMPTY_FILTERS);
    setFilterOpen(false);
    setInvoiceSearch("");
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setPersonSearch(person.name);
    setPersonsOpen(false);
    setInvoiceSearch("");
  };

  const handlePersonSearchChange = (e) => {
    setPersonSearch(e.target.value);
    setPersonsOpen(true);
    // Pokud uživatel maže text, vyčistíme i výběr osoby
    if (!e.target.value) setSelectedPerson(null);
  };

  const handlePersonSearchClear = () => {
    setPersonSearch("");
    setSelectedPerson(null);
    setPersonsOpen(false);
    setInvoiceSearch("");
    personSearchRef.current?.focus();
  };

  const handleFilterChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleFilterReset = () => setFilters(EMPTY_FILTERS);

  const isFiltered = !!(
    filters.product || filters.minPrice || filters.maxPrice ||
    filters.issuedFrom || filters.issuedTo ||
    filters.dueFrom || filters.dueTo || filters.overdue
  );

  const showPersonSearch  = !isPersonContext && needsPersonTab(activeTab);
  const showPersonPrompt  = showPersonSearch && !selectedPerson;
  const showTable         = !needsPersonTab(activeTab) || !!effectivePersonId || isPersonContext;
  const showInvoiceSearch = needsPersonTab(activeTab) && !!effectivePersonId && !isPersonContext;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">{pageEyebrow}</div>
          <h1 className="page-title">{pageTitle}</h1>
        </div>
        <div className="page-actions">
          {!isPersonContext && activeTab === "all" && (
            <>
              <button
                className="btn-outline"
                onClick={() => window.open(`${API_URL}/api/export/invoices/csv`, "_blank")}
                title="Exportovat faktury jako CSV"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                className={`btn-outline${filterOpen ? " btn-outline-active" : ""}`}
                onClick={() => setFilterOpen(o => !o)}
              >
                <Search size={14} />
                Filtr{isFiltered ? " ●" : ""}
              </button>
            </>
          )}
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={15} /> Nová faktura
          </Link>
        </div>
      </div>

      {!isPersonContext && (
        <div className="invoice-controls">
          <div className="tab-switcher">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
                {activeTab === tab.key && showTable && !loading && (
                  <span className="tab-count">{total}</span>
                )}
              </button>
            ))}
          </div>

          {/* Vyhledávací input pro výběr osoby – náhrada za nativní select */}
          {showPersonSearch && (
            <div className="person-search-wrap">
              <div className="person-search-input-wrap">
                <Search size={14} className="person-search-icon" />
                <input
                  ref={personSearchRef}
                  className="person-search-input"
                  placeholder="Hledat osobu podle jména nebo IČO..."
                  value={personSearch}
                  onChange={handlePersonSearchChange}
                  onFocus={() => setPersonsOpen(true)}
                  autoComplete="off"
                />
                {personSearch && (
                  <button
                    type="button"
                    className="person-search-clear"
                    onClick={handlePersonSearchClear}
                    title="Vymazat"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Dropdown se seznamem osob */}
              {personsOpen && filteredPersons.length > 0 && (
                <div ref={personDropRef} className="person-search-dropdown">
                  {filteredPersons.slice(0, 12).map(p => (
                    <div
                      key={p._id}
                      className={`person-search-option${selectedPerson?._id === p._id ? " active" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); handlePersonSelect(p); }}
                    >
                      <span className="person-search-name">{p.name}</span>
                      {p.identificationNumber && (
                        <span className="person-search-ico">IČO: {p.identificationNumber}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Prázdný stav dropdownu */}
              {personsOpen && personSearch && filteredPersons.length === 0 && (
                <div className="person-search-dropdown">
                  <div className="person-search-empty">
                    Žádná osoba nenalezena pro „{personSearch}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info karta při nezvolené osobě v sales/purchases záložce */}
      {showPersonPrompt && (
        <div className="person-prompt">
          <div className="person-prompt-icon">
            <User size={22} />
          </div>
          <div>
            <div className="person-prompt-title">Vyberte osobu</div>
            <div className="person-prompt-sub">
              Začněte psát jméno nebo IČO do pole výše pro výběr osoby
              a zobrazení {activeTab === "sales" ? "vystavených" : "přijatých"} faktur.
            </div>
          </div>
        </div>
      )}

      {/* Klientský search input pro faktury v sales/purchases záložce */}
      {showInvoiceSearch && (
        <div className="invoice-search-bar">
          <div className="invoice-search-input-wrap">
            <Search size={14} className="invoice-search-icon" />
            <input
              className="invoice-search-input"
              placeholder="Hledat podle jména, firmy, čísla faktury nebo produktu..."
              value={invoiceSearch}
              onChange={e => setInvoiceSearch(e.target.value)}
              autoComplete="off"
            />
            {invoiceSearch && (
              <button
                type="button"
                className="person-search-clear"
                onClick={() => setInvoiceSearch("")}
                title="Vymazat hledání"
              >
                <X size={13} />
              </button>
            )}
          </div>
          {selectedPerson && (
            <div className="invoice-search-context">
              <User size={12} />
              <span>{selectedPerson.name}</span>
              <button
                type="button"
                className="invoice-search-context-clear"
                onClick={handlePersonSearchClear}
                title="Změnit osobu"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {filterOpen && activeTab === "all" && !isPersonContext && (
        <div className="filter-bar">
          <div className="filter-row">
            <div className="form-group" style={{ margin: 0, flex: "2 1 180px" }}>
              <label className="form-label">Produkt</label>
              <input
                className="form-input"
                name="product"
                placeholder="Hledat produkt..."
                value={filters.product}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 120px" }}>
              <label className="form-label">Min. cena (Kč)</label>
              <input
                className="form-input input-no-spinner"
                type="number"
                name="minPrice"
                placeholder="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 120px" }}>
              <label className="form-label">Max. cena (Kč)</label>
              <input
                className="form-input input-no-spinner"
                type="number"
                name="maxPrice"
                placeholder="bez limitu"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Vystaveno od</label>
              <input className="form-input" type="date" name="issuedFrom"
                value={filters.issuedFrom} onChange={handleFilterChange} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Vystaveno do</label>
              <input className="form-input" type="date" name="issuedTo"
                value={filters.issuedTo} onChange={handleFilterChange} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Splatnost od</label>
              <input className="form-input" type="date" name="dueFrom"
                value={filters.dueFrom} onChange={handleFilterChange} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Splatnost do</label>
              <input className="form-input" type="date" name="dueTo"
                value={filters.dueTo} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="filter-row" style={{ alignItems: "center" }}>
            <label className="filter-toggle-label">
              <span
                className={`filter-toggle-track${filters.overdue ? " active" : ""}`}
                onClick={() => setFilters(prev => ({ ...prev, overdue: !prev.overdue }))}
                role="checkbox"
                aria-checked={filters.overdue}
                tabIndex={0}
                onKeyDown={e => e.key === " " && setFilters(prev => ({ ...prev, overdue: !prev.overdue }))}
              >
                <span className="filter-toggle-thumb" />
              </span>
              <span className="filter-toggle-text">Pouze po splatnosti</span>
            </label>
            {isFiltered && (
              <div style={{ marginLeft: "auto" }}>
                <button type="button" className="btn-outline" onClick={handleFilterReset}>
                  <X size={14} /> Reset
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {/* Empty state pro filtrování v sales/purchases */}
      {showInvoiceSearch && !loading && filteredInvoices.length === 0 && invoices.length > 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Žádné výsledky</div>
          <div className="empty-state-sub">
            Pro hledání „{invoiceSearch}" nebyly nalezeny žádné faktury.
          </div>
          <button className="btn-outline" style={{ marginTop: "1rem" }} onClick={() => setInvoiceSearch("")}>
            <X size={13} /> Zrušit hledání
          </button>
        </div>
      )}

      {!showPersonPrompt && !(showInvoiceSearch && !loading && filteredInvoices.length === 0 && invoices.length > 0) && (
        loading ? (
          <SkeletonList rows={7} cols={5} />
        ) : (
          <>
            <InvoiceTable
              items={paginated}
              totalFiltered={total}
              totalAll={filteredInvoices.length}
              isFiltered={isFiltered || !!invoiceSearch}
              onDelete={() => loadInvoices(activeTab, effectivePersonId, filters)}
              onOptimisticDelete={(id) => setInvoices(prev => prev.filter(i => i._id !== id))}
              onRollback={(item) => setInvoices(prev => [...prev, item].sort((a, b) => b._id - a._id))}
            />
            <Pagination
              total={total}
              page={page}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </>
        )
      )}
    </div>
  );
};

export default InvoiceIndex;
