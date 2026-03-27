import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  FileText, Users, BarChart2, Sun, Moon,
  Home, ChevronLeft, ChevronRight, Menu,
} from "lucide-react";

import PersonIndex   from "./persons/PersonIndex";
import PersonDetail  from "./persons/PersonDetail";
import PersonForm    from "./persons/PersonForm";
import InvoiceIndex      from "./invoices/InvoiceIndex";
import InvoiceDetail     from "./invoices/InvoiceDetail";
import InvoiceForm       from "./invoices/InvoiceForm";
import InvoiceStatistics from "./invoices/InvoiceStatistics";
import HomePage from "./pages/HomePage";

/* ── Sidebar link ─────────────────────────────── */
function SidebarLink({ to, icon: Icon, label, exact = false, onClick }) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={`sidebar-link${isActive ? " active" : ""}`}
      onClick={onClick}
    >
      <span className="link-icon"><Icon size={17} /></span>
      <span className="link-label">{label}</span>
    </Link>
  );
}

/* ── Topbar title by route ────────────────────── */
function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/home")      return "Dashboard";
  if (pathname.startsWith("/persons/create"))        return "Nová osoba";
  if (/\/persons\/edit\//.test(pathname))            return "Upravit osobu";
  if (/\/persons\/show\//.test(pathname))            return "Detail osoby";
  if (pathname.startsWith("/persons"))               return "Osoby";
  if (pathname.startsWith("/invoices/statistics"))   return "Statistiky";
  if (pathname.startsWith("/invoices/create"))       return "Nová faktura";
  if (/\/invoices\/edit\//.test(pathname))           return "Upravit fakturu";
  if (/\/invoices\/show\//.test(pathname))           return "Detail faktury";
  if (pathname.startsWith("/invoices"))              return "Faktury";
  return "Okvion";
}

/* ── Main App ─────────────────────────────────── */
export function App() {
  const [theme,      setTheme]      = useState(() => localStorage.getItem("theme") || "dark");
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const closeMobile = () => setMobileOpen(false);

  return (
    <Router>
      <div className="app-layout">
        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay${mobileOpen ? " visible" : ""}`}
          onClick={closeMobile}
        />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
          {/* Brand – emoji placeholder logo */}
          <div className="sidebar-brand">
            <span className="brand-emoji" aria-hidden="true">🟣</span>
            <span className="brand-name">Okvion</span>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Hlavní</div>
            <SidebarLink to="/home"     icon={Home}     label="Dashboard"  exact onClick={closeMobile} />
            <SidebarLink to="/persons"  icon={Users}    label="Osoby"            onClick={closeMobile} />
            <SidebarLink to="/invoices" icon={FileText} label="Faktury"          onClick={closeMobile} />

            <div className="sidebar-section-label" style={{ marginTop: "0.5rem" }}>Přehledy</div>
            <SidebarLink to="/invoices/statistics" icon={BarChart2} label="Statistiky" exact onClick={closeMobile} />
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

        {/* ── MAIN ── */}
        <div className={`main-content${collapsed ? " sidebar-collapsed" : ""}`}>
          <TopBar theme={theme} toggleTheme={toggleTheme} onMenuClick={() => setMobileOpen(o => !o)} />

          <div className="page-area">
            <Routes>
              <Route index element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomePage />} />

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

function TopBar({ theme, toggleTheme, onMenuClick }) {
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
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
}

export default App;
