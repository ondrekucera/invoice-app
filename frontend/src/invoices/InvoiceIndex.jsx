import React, { useEffect, useState, useCallback } from "react";
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

const InvoiceIndex = ({ type }) => {
  const { personId: urlPersonId } = useParams();

  const [persons,        setPersons]        = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [activeTab,      setActiveTab]      = useState("all");
  const [invoices,       setInvoices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [filters,        setFilters]        = useState(EMPTY_FILTERS);

  const isPersonContext   = !!urlPersonId;
  const effectivePersonId = isPersonContext ? urlPersonId : selectedPerson;
  const needsPerson       = (tab) => tab === "sales" || tab === "purchases";

  const resetKey = `${activeTab}|${effectivePersonId}|${JSON.stringify(filters)}`;
  const { page, pageSize, setPage, setPageSize, paginated, total } =
    usePagination(invoices, resetKey);

  const getTitle = () => {
    if (type === "sales")     return "Vystavené faktury";
    if (type === "purchases") return "Přijaté faktury";
    return "Faktury";
  };

  const getEyebrow = () => {
    if (isPersonContext) return "Osoba";
    if (type === "sales" || type === "purchases") return "Faktury · Osoba";
    return "Evidence";
  };

  useEffect(() => {
    if (!isPersonContext) {
      apiGet("/api/persons").then(setPersons).catch(() => {});
    }
  }, [isPersonContext]);

  const loadInvoices = useCallback((tab, pid, activeFilters) => {
    setLoading(true);
    setError(null);

    if (isPersonContext) {
      const url = type === "sales"
        ? `/api/invoices/sales/${urlPersonId}`
        : `/api/invoices/purchases/${urlPersonId}`;
      apiGet(url)
        .then(data => { setInvoices(data); setLoading(false); })
        .catch(e   => { setError(getErrorMessage(e)); setLoading(false); });
      return;
    }

    if (tab === "all") {
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
      return;
    }

    if (!pid) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const url = tab === "sales"
      ? `/api/invoices/sales/${pid}`
      : `/api/invoices/purchases/${pid}`;
    apiGet(url)
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
  };

  const handlePersonChange = (e) => {
    setSelectedPerson(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS);
  };

  const isFiltered = !!(
    filters.product || filters.minPrice || filters.maxPrice ||
    filters.issuedFrom || filters.issuedTo ||
    filters.dueFrom || filters.dueTo || filters.overdue
  );

  const showPersonPrompt = !isPersonContext && needsPerson(activeTab) && !effectivePersonId;
  const showTable        = !needsPerson(activeTab) || !!effectivePersonId || isPersonContext;

  const selectedPersonName = persons.find(
    p => String(p._id) === String(selectedPerson)
  )?.name;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">{getEyebrow()}</div>
          <h1 className="page-title">{getTitle()}</h1>
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

          {needsPerson(activeTab) && (
            <div className="person-selector">
              <User size={15} style={{ color: "var(--color-text-dim)", flexShrink: 0 }} />
              <select
                className="form-input person-select"
                value={selectedPerson}
                onChange={handlePersonChange}
              >
                <option value="">— Vyberte osobu —</option>
                {persons.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {showPersonPrompt && (
        <div className="person-prompt">
          <div className="person-prompt-icon">
            <User size={22} />
          </div>
          <div>
            <div className="person-prompt-title">Vyberte osobu</div>
            <div className="person-prompt-sub">
              Pro zobrazení {activeTab === "sales" ? "vystavených" : "přijatých"} faktur
              nejdříve vyberte osobu v nabídce výše.
            </div>
          </div>
        </div>
      )}

      {filterOpen && activeTab === "all" && !isPersonContext && (
        <div className="filter-bar">
          {/* Řádek 1: textové a cenové filtry */}
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
                className="form-input"
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
                className="form-input"
                type="number"
                name="maxPrice"
                placeholder="bez limitu"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>

          {/* Řádek 2: datumové filtry */}
          <div className="filter-row">
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Vystaveno od</label>
              <input
                className="form-input"
                type="date"
                name="issuedFrom"
                value={filters.issuedFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Vystaveno do</label>
              <input
                className="form-input"
                type="date"
                name="issuedTo"
                value={filters.issuedTo}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Splatnost od</label>
              <input
                className="form-input"
                type="date"
                name="dueFrom"
                value={filters.dueFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Splatnost do</label>
              <input
                className="form-input"
                type="date"
                name="dueTo"
                value={filters.dueTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Řádek 3: checkbox + akce */}
          <div className="filter-row" style={{ alignItems: "center" }}>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                name="overdue"
                checked={filters.overdue}
                onChange={handleFilterChange}
              />
              Pouze po splatnosti
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              {isFiltered && (
                <button type="button" className="btn-outline" onClick={handleFilterReset}>
                  <X size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {!isPersonContext && selectedPersonName && needsPerson(activeTab) && (
        <div style={{
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          <User size={13} />
          Faktury osoby:{" "}
          <strong style={{ color: "var(--color-text)" }}>{selectedPersonName}</strong>
        </div>
      )}

      {!showPersonPrompt && (
        loading ? (
          <SkeletonList rows={7} cols={5} />
        ) : (
          <>
            <InvoiceTable
              items={paginated}
              totalFiltered={total}
              totalAll={invoices.length}
              isFiltered={isFiltered}
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
