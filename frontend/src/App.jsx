import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router, Link, Route, Routes, Navigate, useLocation,
} from "react-router-dom";
import {
  FileText, Users, BarChart2, Home, ChevronLeft, ChevronRight, Menu, Settings,
} from "lucide-react";

import PersonIndex   from "./persons/PersonIndex";
import PersonDetail  from "./persons/PersonDetail";
import PersonForm    from "./persons/PersonForm";
import InvoiceIndex      from "./invoices/InvoiceIndex";
import InvoiceDetail     from "./invoices/InvoiceDetail";
import InvoiceForm       from "./invoices/InvoiceForm";
import InvoiceStatistics from "./invoices/InvoiceStatistics";
import HomePage      from "./pages/HomePage";
import SettingsPage  from "./pages/SettingsPage";

// Sidebar link – exact match zabraňuje /invoices/statistics aktivovat /invoices
function SidebarLink({ to, icon: Icon, label, exact = false, onClick }) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link to={to} className={`sidebar-link${isActive ? " active" : ""}`} onClick={onClick}>
      <span className="link-icon"><Icon size={17} /></span>
      <span className="link-label">{label}</span>
    </Link>
  );
}

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/home")      return "Přehled";
  if (pathname.startsWith("/persons/create"))        return "Nová osoba";
  if (/\/persons\/edit\//.test(pathname))            return "Upravit osobu";
  if (/\/persons\/show\//.test(pathname))            return "Detail osoby";
  if (pathname.startsWith("/persons"))               return "Osoby";
  if (pathname.startsWith("/invoices/statistics"))   return "Statistiky";
  if (pathname.startsWith("/invoices/create"))       return "Nová faktura";
  if (/\/invoices\/edit\//.test(pathname))           return "Upravit fakturu";
  if (/\/invoices\/show\//.test(pathname))           return "Detail faktury";
  if (pathname.startsWith("/invoices"))              return "Faktury";
  if (pathname.startsWith("/settings"))              return "Nastavení";
  return "Okvion";
}

export function App() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme,      setTheme]      = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <Router>
      <div className="app-layout">
        <div className={`sidebar-overlay${mobileOpen ? " visible" : ""}`} onClick={closeMobile} />

        <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
          <div className="sidebar-brand">
            <span className="brand-emoji" aria-hidden="true">🟣</span>
            <span className="brand-name">Okvion</span>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Hlavní</div>
            <SidebarLink to="/home"     icon={Home}     label="Přehled"  exact onClick={closeMobile} />
            <SidebarLink to="/persons"  icon={Users}    label="Osoby"         onClick={closeMobile} />
            {/* Faktury – exact zabraňuje aktivaci při /invoices/statistics */}
            <SidebarLinkInvoices onClick={closeMobile} />

            <div className="sidebar-section-label sidebar-section-separator">Přehledy</div>
            <SidebarLink to="/invoices/statistics" icon={BarChart2} label="Statistiky" exact onClick={closeMobile} />

            <div className="sidebar-section-label sidebar-section-separator sidebar-section-separator-bottom">Systém</div>
            <SidebarLink to="/settings" icon={Settings} label="Nastavení" exact onClick={closeMobile} />
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Rozbalit menu" : "Sbalit menu"}
            >
              <span className="link-icon">
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </span>
              <span className="link-label">Sbalit menu</span>
            </button>
          </div>
        </aside>

        <div className={`main-content${collapsed ? " sidebar-collapsed" : ""}`}>
          <TopBar onMenuClick={() => setMobileOpen(o => !o)} theme={theme} onThemeChange={setTheme} />

          <div className="page-area">
            <Routes>
              <Route index element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage theme={theme} onThemeChange={setTheme} />} />

              <Route path="/persons">
                <Route index           element={<PersonIndex />} />
                <Route path="show/:id" element={<PersonDetail />} />
                <Route path="create"   element={<PersonForm />} />
                <Route path="edit/:id" element={<PersonForm />} />
              </Route>

              <Route path="/invoices">
                <Route index                      element={<InvoiceIndex />} />
                <Route path="show/:id"            element={<InvoiceDetail />} />
                <Route path="create"              element={<InvoiceForm />} />
                <Route path="edit/:id"            element={<InvoiceForm />} />
                <Route path="statistics"          element={<InvoiceStatistics />} />
                <Route path="sales/:personId"     element={<InvoiceIndex type="sales" />} />
                <Route path="purchases/:personId" element={<InvoiceIndex type="purchases" />} />
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

// Speciální link pro Faktury – aktivní jen pokud jsme v /invoices ale NE v /invoices/statistics
function SidebarLinkInvoices({ onClick }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith("/invoices") &&
                   !location.pathname.startsWith("/invoices/statistics");
  return (
    <Link to="/invoices" className={`sidebar-link${isActive ? " active" : ""}`} onClick={onClick}>
      <span className="link-icon"><FileText size={17} /></span>
      <span className="link-label">Faktury</span>
    </Link>
  );
}

function TopBar({ onMenuClick, theme, onThemeChange }) {
  const title = usePageTitle();
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick} title="Menu">
          <Menu size={18} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        <TopBarClock />
      </div>
    </div>
  );
}

function TopBarClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Čteme nastavení přímo z localStorage (bez importu aby nedocházelo k circular)
  const getTimeFormat = () => {
    try {
      const s = JSON.parse(localStorage.getItem("invoice_app_settings") || "{}");
      return s.timeFormat || "24h";
    } catch { return "24h"; }
  };

  const fmt = getTimeFormat();
  const dateStr = now.toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = fmt === "12h"
    ? now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", hour12: true })
    : now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="topbar-clock">
      <span className="topbar-clock-date">{dateStr}</span>
      <span className="topbar-clock-sep">·</span>
      <span className="topbar-clock-time">{timeStr}</span>
    </div>
  );
}

export default App;
