import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Hash, DollarSign, TrendingUp, Plus } from "lucide-react";
import { apiGet } from "../utils/api";

const InvoiceStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    apiGet("/api/invoices/statistics")
      .then(data => { setStatistics(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  }, []);

  if (loading)
    return <div className="loading-spinner"><div className="spinner" />Načítám statistiky...</div>;

  if (error)
    return <div className="alert alert-danger">Chyba při načítání: {error}</div>;

  const fmt = (n) => Number(n).toLocaleString("cs-CZ");

  const cards = [
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
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Přehled</div>
          <h1 className="page-title">Statistiky faktur</h1>
        </div>
        <div className="page-actions">
          <Link to="/invoices" className="btn-outline">
            <FileText size={14} /> Všechny faktury
          </Link>
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={14} /> Nová faktura
          </Link>
        </div>
      </div>

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
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.875rem", lineHeight: 1.7 }}>
          Statistiky jsou průběžně aktualizovány z databáze.
          Přejděte do{" "}
          <Link to="/invoices" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            seznamu faktur
          </Link>{" "}
          pro detailní přehled nebo filtrování.
        </p>
      </div>
    </div>
  );
};

export default InvoiceStatistics;
