import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Hash, DollarSign, TrendingUp, Plus, ArrowLeft,
  RefreshCw, AlertCircle, CalendarDays, Trophy, Download, Building2,
  Zap,
} from "lucide-react";
import { apiGet, getErrorMessage, API_URL } from "../utils/api";
import { formatCurrency } from "../utils/formatCurrency";

const InvoiceStatistics = () => {
  const [statistics,   setStatistics]   = useState(null);
  const [revenue,      setRevenue]      = useState(null);
  // Default na aktuální rok – uživatel typicky chce vidět nejnovější obrat.
  const [revenueYear,  setRevenueYear]  = useState(new Date().getFullYear());
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [revLoading,   setRevLoading]   = useState(true);
  const [revError,     setRevError]     = useState(null);

  const loadStats = () => {
    setLoading(true);
    setError(null);
    apiGet("/api/invoices/statistics")
      .then(data => { setStatistics(data); setLoading(false); })
      .catch(e   => { setError(getErrorMessage(e)); setLoading(false); });
  };

  const loadRevenue = (year) => {
    setRevLoading(true);
    setRevError(null);
    apiGet("/api/persons/statistics/revenue", { year })
      .then(data => { setRevenue(data); setRevLoading(false); })
      .catch(e   => { setRevError(getErrorMessage(e)); setRevLoading(false); });
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadRevenue(revenueYear); }, [revenueYear]);

  // Primární (velké) KPI karty – nejdůležitější metriky
  const primaryCards = statistics ? [
    {
      label: "Celková fakturace",
      value: formatCurrency(statistics.invoicesSum) + " Kč",
      sub:   "celkem bez DPH",
      icon:  DollarSign,
      color: "var(--color-success)",
      bg:    "rgba(34,197,94,0.1)",
      size:  "lg",
    },
    {
      label: "Celkem s DPH",
      value: formatCurrency(statistics.totalWithVat) + " Kč",
      sub:   "včetně DPH",
      icon:  TrendingUp,
      color: "var(--color-info)",
      bg:    "rgba(59,130,246,0.1)",
      size:  "lg",
    },
  ] : [];

  // Sekundární KPI karty
  const secondaryCards = statistics ? [
    {
      label:     "Počet faktur",
      value:     formatCurrency(statistics.invoiceCount),
      sub:       "evidovaných",
      icon:      Hash,
      color:     "var(--color-primary)",
      bg:        "rgba(124,58,237,0.1)",
    },
    {
      label:     "Průměrná faktura",
      value:     formatCurrency(statistics.invoicesAverage) + " Kč",
      sub:       "bez DPH",
      icon:      FileText,
      color:     "var(--color-warning)",
      bg:        "rgba(234,179,8,0.1)",
    },
    {
      label:     "Nejvyšší faktura",
      value:     formatCurrency(statistics.highestInvoice) + " Kč",
      sub:       "maximální hodnota",
      icon:      Trophy,
      color:     "#f59e0b",
      bg:        "rgba(245,158,11,0.1)",
    },
    {
      label:     "Tento měsíc",
      value:     formatCurrency(statistics.thisMonthCount),
      sub:       "faktur",
      icon:      CalendarDays,
      color:     "var(--color-primary)",
      bg:        "rgba(124,58,237,0.08)",
    },
  ] : [];

  const hasOverdue = statistics?.overdueCount > 0;

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
          <button
            className="btn-outline"
            onClick={() => window.open(`${API_URL}/api/export/invoices/csv`, "_blank")}
            title="Exportovat faktury jako CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-outline" onClick={loadStats} disabled={loading} title="Aktualizovat statistiky">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
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
        <div className="alert alert-danger">Chyba při načítání statistik: {error}</div>
      )}

      {!loading && !error && statistics && (
        <>
          {/* Přehled po splatnosti – vizuálně prominentní pokud existují */}
          {hasOverdue && (
            <div className="stats-overdue-banner">
              <div className="stats-overdue-icon">
                <AlertCircle size={18} />
              </div>
              <div className="stats-overdue-text">
                <span className="stats-overdue-count">{statistics.overdueCount}</span>
                {statistics.overdueCount === 1 ? " faktura po splatnosti" : statistics.overdueCount < 5 ? " faktury po splatnosti" : " faktur po splatnosti"}
              </div>
              <Link to="/invoices?overdue=true" className="stats-overdue-link">
                Zobrazit <Zap size={12} />
              </Link>
            </div>
          )}

          {/* Primární KPI – velké karty */}
          <div className="stats-primary-grid">
            {primaryCards.map(c => {
              const Icon = c.icon;
              return (
                <div className="stat-card stat-card--primary" key={c.label}>
                  <div className="stat-card-icon" style={{ background: c.bg }}>
                    <Icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value stat-value--lg">{c.value}</div>
                  <div className="stat-sub">{c.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Sekundární KPI – menší karty */}
          <div className="stat-cards stat-cards--secondary">
            {secondaryCards.map(c => {
              const Icon = c.icon;
              return (
                <div className="stat-card" key={c.label}>
                  <div className="stat-card-icon" style={{ background: c.bg }}>
                    <Icon size={17} style={{ color: c.color }} />
                  </div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{c.value}</div>
                  <div className="stat-sub">{c.sub}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Spodní sekce – obrat firem + info */}
      <div className="stats-bottom-grid">
        {/* Firemní obrat */}
        <div className="card stats-revenue-card">
          <div className="card-header stats-revenue-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Building2 size={16} style={{ color: "var(--color-primary)" }} />
              Obrat firem
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0, fontSize: "0.8rem" }}>Rok:</label>
              <select
                className="form-input input-no-spinner"
                style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                value={revenueYear}
                onChange={e => setRevenueYear(Number(e.target.value))}
              >
                {[0,1,2,3,4].map(offset => {
                  const y = new Date().getFullYear() - offset;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
              <button
                className="btn-outline"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                onClick={() => loadRevenue(revenueYear)}
                disabled={revLoading}
                title="Aktualizovat"
              >
                <RefreshCw size={13} className={revLoading ? "spin" : ""} />
              </button>
            </div>
          </div>

          {revLoading && (
            <div className="loading-spinner" style={{ padding: "1.5rem 0" }}>
              <div className="spinner" />Načítám obrat firem...
            </div>
          )}
          {revError && (
            <div className="alert alert-danger" style={{ margin: "1rem 0 0" }}>
              Chyba při načítání obratu: {revError}
            </div>
          )}
          {!revLoading && !revError && revenue && (
            revenue.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 0" }}>
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">Žádná data</div>
                <div className="empty-state-sub">Pro rok {revenueYear} nebyly nalezeny žádné faktury.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th style={{ width: "2.5rem" }}>#</th>
                      <th>Firma</th>
                      <th>IČO</th>
                      <th style={{ textAlign: "right" }}>Obrat {revenueYear} (Kč)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.map((row, idx) => (
                      <tr key={row.personId ?? idx} className={idx === 0 ? "stats-table-top" : ""}>
                        <td className="stats-table-rank">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </td>
                        <td>
                          <Link
                            to={`/persons/show/${row.personId}`}
                            style={{ color: "var(--color-primary)", fontWeight: 600 }}
                          >
                            {row.name ?? "—"}
                          </Link>
                        </td>
                        <td style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                          {row.identificationNumber ?? "—"}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {formatCurrency(row.revenue ?? 0)} Kč
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Info karta */}
        <div className="card stats-info-card">
          <div className="card-header">
            <span className="card-title">O statistikách</span>
          </div>
          <div className="stats-info-body">
            <p>
              Všechna čísla vycházejí z aktuálních dat v databázi a aktualizují se v reálném čase.
            </p>
            <div className="stats-info-list">
              <div className="stats-info-item">
                <span className="stats-info-dot" style={{ background: "var(--color-success)" }} />
                <span><strong>Celková fakturace</strong> = součet všech faktur bez DPH</span>
              </div>
              <div className="stats-info-item">
                <span className="stats-info-dot" style={{ background: "var(--color-info)" }} />
                <span><strong>Obrat firem</strong> = prodeje jako dodavatel za rok</span>
              </div>
              <div className="stats-info-item">
                <span className="stats-info-dot" style={{ background: "var(--color-danger)" }} />
                <span><strong>Po splatnosti</strong> = faktury s uplynulým datem splatnosti</span>
              </div>
            </div>
            <div className="stats-info-actions">
              <button
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
                onClick={() => window.open(`${API_URL}/api/export/invoices/csv`, "_blank")}
              >
                <Download size={12} /> Export CSV
              </button>
              <Link
                to="/invoices"
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
              >
                <FileText size={12} /> Faktury
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatistics;
