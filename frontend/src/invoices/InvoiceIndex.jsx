import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, X, Plus, User } from "lucide-react";
import { apiGet } from "../utils/api";
import InvoiceTable from "./InvoiceTable";
import Pagination from "../components/Pagination";
import { usePagination } from "../components/usePagination";

const TABS = [
  { key: "all",       label: "Všechny" },
  { key: "sales",     label: "Vystavené" },
  { key: "purchases", label: "Přijaté" },
];

const InvoiceIndex = ({ type }) => {
  const { personId: urlPersonId } = useParams();

  const [persons,        setPersons]        = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [activeTab,      setActiveTab]      = useState("all");
  const [invoices,       setInvoices]       = useState([]);   // všechna načtená data
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [filters,        setFilters]        = useState({ product: "", minPrice: "", maxPrice: "" });

  const isPersonContext   = !!urlPersonId;
  const effectivePersonId = isPersonContext ? urlPersonId : selectedPerson;
  const needsPerson       = (tab) => tab === "sales" || tab === "purchases";

  /* resetKey – při změně tabu, filtru nebo osoby jde stránka zpět na 1 */
  const resetKey = `${activeTab}|${effectivePersonId}|${JSON.stringify(filters)}`;
  const { page, pageSize, setPage, setPageSize, paginated, total } =
    usePagination(invoices, resetKey);

  const getTitle = () => {
    if (type === "sales")     return "Vystavené faktury";
    if (type === "purchases") return "Přijaté faktury";
    return "Faktury";
  };

  /* Načti seznam osob (jen na hlavní stránce) */
  useEffect(() => {
    if (!isPersonContext) {
      apiGet("/api/persons").then(setPersons).catch(() => {});
    }
  }, [isPersonContext]);

  /* Načítání faktur z backendu */
  const loadInvoices = (tab, pid, activeFilters) => {
    setLoading(true);
    setError(null);

    /* URL kontext osoby (z detailu osoby) */
    if (isPersonContext) {
      const url = type === "sales"
        ? `/api/invoices/sales/${urlPersonId}`
        : `/api/invoices/purchases/${urlPersonId}`;
      apiGet(url)
        .then(data => { setInvoices(data); setLoading(false); })
        .catch(e   => { setError(e.message); setLoading(false); });
      return;
    }

    /* Tab "Všechny" */
    if (tab === "all") {
      const params = {};
      if (activeFilters.product)  params.product  = activeFilters.product;
      if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
      if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;
      apiGet("/api/invoices", params)
        .then(data => { setInvoices(data); setLoading(false); })
        .catch(e   => { setError(e.message); setLoading(false); });
      return;
    }

    /* Tab Vystavené / Přijaté bez osoby */
    if (!pid) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    /* Tab Vystavené / Přijaté s osobou */
    const url = tab === "sales"
      ? `/api/invoices/sales/${pid}`
      : `/api/invoices/purchases/${pid}`;
    apiGet(url)
      .then(data => { setInvoices(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  };

  useEffect(() => {
    loadInvoices(activeTab, effectivePersonId, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, effectivePersonId, urlPersonId, type]);

  /* Handlery */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const clearedFilters = { product: "", minPrice: "", maxPrice: "" };
    setFilters(clearedFilters);
    setFilterOpen(false);
    loadInvoices(tab, effectivePersonId, clearedFilters);
  };

  const handlePersonChange = (e) => {
    const pid = e.target.value;
    setSelectedPerson(pid);
    loadInvoices(activeTab, pid, filters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadInvoices(activeTab, effectivePersonId, filters);
  };

  const handleFilterReset = () => {
    const empty = { product: "", minPrice: "", maxPrice: "" };
    setFilters(empty);
    loadInvoices(activeTab, effectivePersonId, empty);
  };

  const isFiltered      = !!(filters.product || filters.minPrice || filters.maxPrice);
  const showPersonPrompt = !isPersonContext && needsPerson(activeTab) && !effectivePersonId;
  const showTable        = !needsPerson(activeTab) || !!effectivePersonId || isPersonContext;

  const selectedPersonName = persons.find(
    p => String(p._id) === String(selectedPerson)
  )?.name;

  return (
    <div>
      {/* Záhlaví */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">{isPersonContext ? "Osoba" : "Evidence"}</div>
          <h1 className="page-title">{getTitle()}</h1>
        </div>
        <div className="page-actions">
          {!isPersonContext && activeTab === "all" && (
            <button
              className={`btn-outline${filterOpen ? " btn-outline-active" : ""}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              <Search size={14} />
              Filtr{isFiltered ? " ●" : ""}
            </button>
          )}
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={15} /> Nová faktura
          </Link>
        </div>
      </div>

      {/* Taby + výběr osoby */}
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
                {activeTab === tab.key && showTable && (
                  <span className="tab-count">{invoices.length}</span>
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

      {/* Prompt – vyberte osobu */}
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

      {/* Filter bar */}
      {filterOpen && activeTab === "all" && !isPersonContext && (
        <form className="filter-bar" onSubmit={handleFilterSubmit}>
          <div className="form-group" style={{ margin: 0, flex: "1 1 160px" }}>
            <label className="form-label">Produkt</label>
            <input
              className="form-input"
              name="product"
              placeholder="Hledat produkt..."
              value={filters.product}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group" style={{ margin: 0, flex: "1 1 110px" }}>
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
          <div className="form-group" style={{ margin: 0, flex: "1 1 110px" }}>
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
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <button type="submit" className="btn-primary">
              <Search size={14} /> Filtrovat
            </button>
            {isFiltered && (
              <button type="button" className="btn-outline" onClick={handleFilterReset}>
                <X size={14} /> Reset
              </button>
            )}
          </div>
        </form>
      )}

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {/* Info řádek – aktivní osoba */}
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

      {/* Obsah */}
      {!showPersonPrompt && (
        loading ? (
          <div className="loading-spinner">
            <div className="spinner" /> Načítám faktury...
          </div>
        ) : (
          <>
            <InvoiceTable
              items={paginated}
              totalFiltered={total}
              isFiltered={isFiltered}
              onDelete={() => loadInvoices(activeTab, effectivePersonId, filters)}
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
