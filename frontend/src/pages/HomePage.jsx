import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Users, BarChart2, Plus, ArrowRight,
  TrendingUp, DollarSign, Hash, Eye, RefreshCw,
} from "lucide-react";
import { apiGet } from "../utils/api";
import { formatCurrency } from "../utils/formatCurrency";

const HomePage = () => {
  const [stats, setStats]       = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [persons, setPersons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      apiGet("/api/invoices/statistics"),
      apiGet("/api/invoices"),
      apiGet("/api/persons"),
    ])
      .then(([s, inv, per]) => {
        setStats(s);
        setInvoices(inv.slice(0, 5));
        setPersons(per);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);


  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Dashboard</div>
          <h1 className="page-title">Přehled</h1>
          <div className="page-sub">Vítejte v Okvionu</div>
        </div>
        <div className="page-actions">
          <Link to="/invoices/create" className="btn-primary">
            <Plus size={15} />
            Nová faktura
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" />Načítám...</div>
      ) : error ? (
        <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <span>Nepodařilo se načíst data. Zkontrolujte, zda běží backend.</span>
          <button
            className="btn-outline"
            onClick={loadData}
            disabled={loading}
            style={{ whiteSpace: "nowrap" }}
          >
            <RefreshCw size={14} /> Zkusit znovu
          </button>
        </div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "rgba(124,58,237,0.12)" }}>
                <Hash size={17} style={{ color: "var(--color-primary)" }} />
              </div>
              <div className="stat-label">Počet faktur</div>
              <div className="stat-value">{formatCurrency(stats?.invoiceCount ?? 0)}</div>
              <div className="stat-sub">celkem evidovaných</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.1)" }}>
                <DollarSign size={17} style={{ color: "var(--color-success)" }} />
              </div>
              <div className="stat-label">Celková částka</div>
              <div className="stat-value" style={{ fontSize: "1.45rem" }}>
                {formatCurrency(stats?.invoicesSum ?? 0)} Kč
              </div>
              <div className="stat-sub">součet všech faktur</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "rgba(59,130,246,0.1)" }}>
                <TrendingUp size={17} style={{ color: "var(--color-info)" }} />
              </div>
              <div className="stat-label">Průměrná faktura</div>
              <div className="stat-value" style={{ fontSize: "1.45rem" }}>
                {formatCurrency(stats?.invoicesAverage ?? 0)} Kč
              </div>
              <div className="stat-sub">průměrná hodnota</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Users size={17} style={{ color: "var(--color-warning)" }} />
              </div>
              <div className="stat-label">Osoby</div>
              <div className="stat-value">{persons.length}</div>
              <div className="stat-sub">evidovaných subjektů</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Rychlé akce</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link to="/invoices/create" className="btn-primary" style={{ justifyContent: "center" }}>
                  <Plus size={15} /> Nová faktura
                </Link>
                <Link to="/persons/create" className="btn-outline" style={{ justifyContent: "center" }}>
                  <Users size={15} /> Nová osoba
                </Link>
                <Link to="/invoices/statistics" className="btn-outline" style={{ justifyContent: "center" }}>
                  <BarChart2 size={15} /> Statistiky faktur
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Navigace</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { to: "/invoices", icon: FileText, label: "Všechny faktury", sub: `${stats?.invoiceCount ?? 0} záznamů` },
                  { to: "/persons",  icon: Users,    label: "Seznam osob",     sub: `${persons.length} subjektů` },
                  { to: "/invoices/statistics", icon: BarChart2, label: "Statistiky", sub: "přehled KPI" },
                ].map(({ to, icon: Icon, label, sub }) => (
                  <Link key={to} to={to} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.6rem 0.75rem", borderRadius: "8px",
                    background: "var(--bg-input)", border: "1px solid var(--color-border)",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-primary)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <Icon size={15} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{sub}</div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: "var(--color-text-dim)" }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Poslední faktury</span>
              <Link to="/invoices" className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                Zobrazit vše <ArrowRight size={13} />
              </Link>
            </div>

            {invoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                Žádné faktury zatím neexistují.{" "}
                <Link to="/invoices/create" style={{ color: "var(--color-primary)" }}>Vytvořit první fakturu →</Link>
              </div>
            ) : (
              <div className="invoice-list">
                {invoices.map((item) => (
                  <div key={item._id} className="invoice-row">
                    <div className="invoice-num">#{item.invoiceNumber}</div>
                    <div className="invoice-product">{item.product}</div>
                    <div className="invoice-person">
                      <div className="person-label">Dodavatel</div>
                      {item.seller?._id
                        ? <Link to={"/persons/show/" + item.seller._id}>{item.seller.name}</Link>
                        : <span>{item.seller?.name ?? "—"}</span>}
                    </div>
                    <div className="invoice-person">
                      <div className="person-label">Odběratel</div>
                      {item.buyer?._id
                        ? <Link to={"/persons/show/" + item.buyer._id}>{item.buyer.name}</Link>
                        : <span>{item.buyer?.name ?? "—"}</span>}
                    </div>
                    <div className="invoice-price">{formatCurrency(item.price)} Kč</div>
                    <div className="invoice-actions">
                      <Link to={"/invoices/show/" + item._id} className="btn-icon info" title="Detail faktury">
                        <Eye size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
