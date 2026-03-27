import React, { useEffect, useState, useMemo } from "react";
import { Search, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet } from "../utils/api";
import PersonTable from "./PersonTable";
import Pagination from "../components/Pagination";
import { usePagination } from "../components/usePagination";

const PersonIndex = () => {
  const [persons,    setPersons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query,      setQuery]      = useState({ name: "", ico: "", city: "" });

  const loadPersons = () => {
    setLoading(true);
    apiGet("/api/persons")
      .then(data => { setPersons(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  };

  const deletePerson = async (id) => {
    try {
      await apiDelete("/api/persons/" + id);
      setPersons(prev => prev.filter(item => item._id !== id));
    } catch (e) {
      alert("Chyba při mazání: " + e.message);
    }
  };

  useEffect(() => { loadPersons(); }, []);

  /* Lokální filtrace */
  const filtered = useMemo(() => {
    return persons.filter(p => {
      const nameMatch = !query.name ||
        (p.name || "").toLowerCase().includes(query.name.toLowerCase());
      const icoMatch  = !query.ico  ||
        (p.identificationNumber || "").includes(query.ico);
      const cityMatch = !query.city ||
        (p.city || "").toLowerCase().includes(query.city.toLowerCase());
      return nameMatch && icoMatch && cityMatch;
    });
  }, [persons, query]);

  /* resetKey = serializovaný filtr → při každé změně filtru jde stránka na 1 */
  const resetKey = JSON.stringify(query);
  const { page, pageSize, setPage, setPageSize, paginated, total } =
    usePagination(filtered, resetKey);

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => setQuery({ name: "", ico: "", city: "" });

  const isFiltered = query.name || query.ico || query.city;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Evidence</div>
          <h1 className="page-title">Osoby</h1>
        </div>
        <div className="page-actions">
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

      {/* Filtrační bar */}
      {filterOpen && (
        <div className="filter-bar">
          <div className="form-group" style={{ margin: 0, flex: "1 1 180px" }}>
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
          {isFiltered && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-outline" onClick={handleReset}>
                <X size={14} /> Reset
              </button>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert alert-danger">Chyba: {error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" /> Načítám osoby...
        </div>
      ) : (
        <>
          <PersonTable
            deletePerson={deletePerson}
            items={paginated}
            totalFiltered={total}
            totalAll={persons.length}
            isFiltered={!!isFiltered}
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
