import React, { useEffect, useState, useCallback, useRef } from "react";
import { Search, X, Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet, parseApiError } from "../utils/api";
import PersonTable from "./PersonTable";
import Pagination from "../components/Pagination";
import { usePagination } from "../components/usePagination";
import { useToast } from "../components/ToastContext";
import SkeletonList from "../components/SkeletonList";
import { CATEGORY_LABELS } from "./PersonForm";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const EMPTY_QUERY = { name: "", ico: "", city: "", category: "" };
const DEBOUNCE_MS = 350;

const PersonIndex = () => {
  const [persons,    setPersons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query,      setQuery]      = useState(EMPTY_QUERY);
  const { addToast } = useToast();
  const debounceRef  = useRef(null);

  // Načtení osob z backendu s filtry
  const loadPersons = useCallback((activeQuery) => {
    setLoading(true);
    setError(null);

    const params = {};
    if (activeQuery.name) params.name = activeQuery.name;
    if (activeQuery.ico)  params.identificationNumber = activeQuery.ico;
    if (activeQuery.city) params.city = activeQuery.city;
    if (activeQuery.category) params.category = activeQuery.category;

    apiGet("/api/persons", params)
      .then(data => { setPersons(data); setLoading(false); })
      .catch(e   => { setError(parseApiError(e).message); setLoading(false); });
  }, []);

  // Debounce – spustí se 350ms po poslední změně filtru
  const scheduleLoad = useCallback((nextQuery) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadPersons(nextQuery), DEBOUNCE_MS);
  }, [loadPersons]);

  // Úvodní načtení
  useEffect(() => {
    loadPersons(EMPTY_QUERY);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [loadPersons]);

  const deletePerson = async (id) => {
    const person = persons.find(p => p._id === id);
    // Optimistic update
    setPersons(prev => prev.filter(item => item._id !== id));
    try {
      await apiDelete("/api/persons/" + id);
      addToast(`Osoba „${person?.name ?? id}" byla smazána.`, "success");
    } catch (e) {
      // Rollback
      setPersons(prev => [...prev, person].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));
      addToast(parseApiError(e).message, "error");
    }
  };

  const resetKey = JSON.stringify(query);
  const { page, pageSize, setPage, setPageSize, paginated, total } =
    usePagination(persons, resetKey);

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    const nextQuery = { ...query, [name]: value };
    setQuery(nextQuery);
    scheduleLoad(nextQuery);
  };

  const handleReset = () => {
    setQuery(EMPTY_QUERY);
    loadPersons(EMPTY_QUERY);
  };

  const isFiltered = !!(query.name || query.ico || query.city || query.category);

  const handleExport = () => {
    window.open(`${API_URL}/api/export/persons/csv`, "_blank");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Evidence</div>
          <h1 className="page-title">Osoby</h1>
        </div>
        <div className="page-actions">
          <button
            className="btn-outline"
            onClick={handleExport}
            title="Exportovat osoby jako CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            className={`btn-outline${filterOpen ? " btn-outline-active" : ""}`}
            onClick={() => setFilterOpen(o => !o)}
          >
            <Search size={14} />
            Hledat{isFiltered ? " ●" : ""}
          </button>
          <Link to="/persons/create" className="btn-primary">
            <Plus size={15} /> Nová osoba
          </Link>
        </div>
      </div>

      {filterOpen && (
        <div className="filter-bar">
          <div className="filter-row">
            <div className="form-group" style={{ margin: 0, flex: "2 1 180px" }}>
              <label className="form-label">Jméno / Firma</label>
              <input
                className="form-input"
                name="name"
                placeholder="Hledat podle jména..."
                value={query.name}
                onChange={handleQueryChange}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 120px" }}>
              <label className="form-label">IČO</label>
              <input
                className="form-input"
                name="ico"
                placeholder="12345678"
                value={query.ico}
                onChange={handleQueryChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 120px" }}>
              <label className="form-label">Město</label>
              <input
                className="form-input"
                name="city"
                placeholder="Praha"
                value={query.city}
                onChange={handleQueryChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
              <label className="form-label">Kategorie</label>
              <select
                className="form-input"
                name="category"
                value={query.category}
                onChange={handleQueryChange}
              >
                <option value="">— Vše —</option>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {isFiltered && (
            <div className="filter-row">
              <button className="btn-outline" onClick={handleReset} style={{ marginLeft: "auto" }}>
                <X size={14} /> Reset filtru
              </button>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {loading ? (
        <SkeletonList rows={7} cols={3} />
      ) : (
        <>
          <PersonTable
            deletePerson={deletePerson}
            items={paginated}
            totalFiltered={total}
            totalAll={persons.length}
            isFiltered={isFiltered}
          />
          <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </>
      )}
    </div>
  );
};

export default PersonIndex;
