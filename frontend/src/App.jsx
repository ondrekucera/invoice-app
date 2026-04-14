import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import {
  Users, BarChart2, Home, ChevronLeft, ChevronRight, Sun, Moon, Receipt,
} from "lucide-react";

import BrandLogo from "./components/BrandLogo";
import { AppRoutes } from "./layout/AppRoutes";
import { TopBar } from "./layout/TopBar";
import { SidebarLink, SidebarLinkInvoices, SettingsLink } from "./layout/SidebarLink";

/**
 * Kořenová komponenta aplikace.
 * Zodpovídá za layout (sidebar + hlavní obsah), stav tématu a mobilní menu.
 * Routování a navigace jsou odděleny do AppRoutes a SidebarLink komponent.
 */
export function App() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme,      setTheme]      = useState(() => localStorage.getItem("theme") || "dark");

  // Téma se aplikuje jako data-theme atribut na <html> – CSS proměnné reagují automaticky
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const closeMobile = () => setMobileOpen(false);

  return (
    <Router>
      <div className="app-layout">
        {/* Průhledný overlay pro zavření mobilního menu kliknutím mimo sidebar */}
        <div className={`sidebar-overlay${mobileOpen ? " visible" : ""}`} onClick={closeMobile} />

        <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>

          {/* ── Brand blok – logo "O" + text "KVION" tvoří jedno slovo OKVION ── */}
          <div className="sidebar-brand">
            <div className="brand-wordmark-wrap">
              <BrandLogo size={collapsed ? 26 : 32} collapsed={collapsed} />
              {!collapsed && (
                <span className="brand-sub">Invoice Manager</span>
              )}
            </div>
          </div>

          {/* ── Hlavní navigace ── */}
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Hlavní</div>
            <SidebarLink to="/home"    icon={Home}  label="Přehled"  exact onClick={closeMobile} />
            <SidebarLink to="/persons" icon={Users} label="Osoby"         onClick={closeMobile} />
            <SidebarLinkInvoices onClick={closeMobile} />
            <SidebarLink to="/expenses" icon={Receipt} label="Náklady" onClick={closeMobile} />

            <div className="sidebar-section-label sidebar-section-separator">Přehledy</div>
            <SidebarLink to="/invoices/statistics" icon={BarChart2} label="Statistiky" exact onClick={closeMobile} />
          </nav>

          {/* ── Utility blok dole: nastavení, přepínač tématu, sbalit ── */}
          <div className="sidebar-footer">
            <div className="sidebar-utility">
              <SettingsLink onClick={closeMobile} />

              <button
                className="sidebar-theme-btn"
                onClick={toggleTheme}
                title={theme === "dark" ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
              >
                <span className="link-icon">
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </span>
                <span className="link-label sidebar-theme-label">
                  {theme === "dark" ? "Světlý" : "Tmavý"}
                </span>
              </button>
            </div>

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
          <TopBar onMenuClick={() => setMobileOpen(o => !o)} />

          <div className="page-area">
            <AppRoutes theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
