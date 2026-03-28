import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Hash, DollarSign, TrendingUp, Plus, ArrowLeft, RefreshCw } from "lucide-react";
import { apiGet } from "../utils/api";

const InvoiceStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const loadStats = () => {
    setLoading(true);
    setError(null);
    apiGet("/api/invoices/statistics")
      .then(data => { setStatistics(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadStats(); }, []);

  const fmt = (n) => Number(n).toLocaleString("cs-CZ");

  const cards = statistics ? [
    {
      label: "Počet faktur",
      value: fmt(statistics.invoiceCount),
      sub: "celkem evidovaných",
      icon: Hash,
      color: "var(--color-primary)",
      bg: "rgba(124,58,237,0.1)",
    },
    {
      label: "Celková částka",
      value: fmt(statistics.invoicesSum) + " Kč",
      sub: "součet všech faktur",
      icon: DollarSign,
      color: "var(--color-success)",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      label: "Průměrná faktura",
      value: fmt(statistics.invoicesAverage) + " Kč",
      sub: "průměrná hodnota",
      icon: TrendingUp,
      color: "var(--color-info)",
      bg: "rgba(59,130,246,0.1)",
    },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Faktury · Přehled</div>
          <h1 className="page-title">Statistiky</h1>
          <div className="page-sub">Souhrn fakturační aktivity</div>
        </div>
        <div className="page-actions">
          <Link to="/invoices" className="btn-outline">
            <ArrowLeft size={14} /> Zpět na faktury
          </Link>
          <button className="btn-outline" onClick={loadStats} title="Aktualizovat statistiky">
            <RefreshCw size={14} />
          </button>
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={14} /> Nová faktura
          </Link>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner"><div className="spinner" />Načítám statistiky...</div>
      )}

      {error && (
        <div className="alert alert-danger">Chyba při načítání: {error}</div>
      )}

      {!loading && !error && statistics && (
        <>
          <div className="stat-cards">
            {cards.map(c => {
              const Icon = c.icon;
              return (
                <div className="stat-card" key={c.label}>
                  <div className="stat-card-icon" style={{ background: c.bg }}>
                    <Icon size={17} style={{ color: c.color }} />
                  </div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{c.value}</div>
                  <div className="stat-sub">{c.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">O statistikách</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.875rem", lineHeight: 1.7 }}>
              Statistiky jsou vypočítány z aktuálních dat v databázi a zahrnují všechny evidované faktury.
              Použijte tlačítko{" "}
              <strong style={{ color: "var(--color-text)" }}>Aktualizovat</strong>{" "}
              pro načtení nejnovějších hodnot, nebo přejděte do{" "}
              <Link to="/invoices" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                seznamu faktur
              </Link>{" "}
              pro detailní přehled a filtrování.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceStatistics;
