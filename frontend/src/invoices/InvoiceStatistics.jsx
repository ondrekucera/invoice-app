import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Hash, DollarSign, TrendingUp, Plus, ArrowLeft,
  RefreshCw, AlertCircle, CalendarDays, Trophy, Download, Building2,
} from "lucide-react";
import { apiGet, getErrorMessage } from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const InvoiceStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [revenue,    setRevenue]    = useState(null);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear() - 1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [revLoading, setRevLoading] = useState(true);
  const [revError,   setRevError]   = useState(null);

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
      sub: "součet bez DPH",
      icon: DollarSign,
      color: "var(--color-success)",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      label: "Celkem s DPH",
      value: fmt(statistics.totalWithVat) + " Kč",
      sub: "součet včetně DPH",
      icon: TrendingUp,
      color: "var(--color-info)",
      bg: "rgba(59,130,246,0.1)",
    },
    {
      label: "Průměrná faktura",
      value: fmt(statistics.invoicesAverage) + " Kč",
      sub: "průměrná hodnota bez DPH",
      icon: FileText,
      color: "var(--color-warning)",
      bg: "rgba(234,179,8,0.1)",
    },
    {
      label: "Nejvyšší faktura",
      value: fmt(statistics.highestInvoice) + " Kč",
      sub: "maximální hodnota",
      icon: Trophy,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "Tento měsíc",
      value: fmt(statistics.thisMonthCount),
      sub: "faktur vystavených v tomto měsíci",
      icon: CalendarDays,
      color: "var(--color-primary)",
      bg: "rgba(124,58,237,0.08)",
    },
    {
      label: "Po splatnosti",
      value: fmt(statistics.overdueCount),
      sub: "faktur s uplynulou splatností",
      icon: AlertCircle,
      color: "var(--color-danger)",
      bg: "rgba(239,68,68,0.1)",
      highlight: statistics.overdueCount > 0,
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

      {/* Souhrnné statistiky */}
      {loading && (
        <div className="loading-spinner"><div className="spinner" />Načítám statistiky...</div>
      )}
      {error && (
        <div className="alert alert-danger">Chyba při načítání statistik: {error}</div>
      )}
      {!loading && !error && statistics && (
        <div className="stat-cards">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <div
                className="stat-card"
                key={c.label}
                style={c.highlight ? { borderColor: "var(--color-danger)", borderWidth: 1, borderStyle: "solid" } : {}}
              >
                <div className="stat-card-icon" style={{ background: c.bg }}>
                  <Icon size={17} style={{ color: c.color }} />
                </div>
                <div className="stat-label">{c.label}</div>
                <div
                  className="stat-value"
                  style={{ fontSize: "1.5rem", color: c.highlight ? "var(--color-danger)" : undefined }}
                >
                  {c.value}
                </div>
                <div className="stat-sub">{c.sub}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Firemní obrat */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={16} style={{ color: "var(--color-primary)" }} />
            Obrat firem
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label className="form-label" style={{ margin: 0, fontSize: "0.8rem" }}>Rok:</label>
            <select
              className="form-input"
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
                    <th>#</th>
                    <th>Firma</th>
                    <th>IČO</th>
                    <th style={{ textAlign: "right" }}>Obrat {revenueYear} (Kč)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((row, idx) => (
                    <tr key={row.personId ?? idx} className={idx === 0 ? "stats-table-top" : ""}>
                      <td style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{idx + 1}</td>
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
                        {fmt(row.revenue ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="card-header">
          <span className="card-title">O statistikách</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.875rem", lineHeight: 1.7 }}>
          Statistiky jsou vypočítány z aktuálních dat v databázi. Obrat firem zobrazuje součet vystavených faktur
          (jako prodávající) za zvolený rok. Použijte{" "}
          <strong style={{ color: "var(--color-text)" }}>Export CSV</strong> pro stažení dat, nebo přejděte do{" "}
          <Link to="/invoices" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            seznamu faktur
          </Link>{" "}
          pro detailní přehled a filtrování.
        </p>
      </div>
    </div>
  );
};

export default InvoiceStatistics;
