import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Settings } from "lucide-react";

/**
 * Generický navigační odkaz v sidebaru.
 * Parametr exact=true aktivuje odkaz pouze při přesné shodě cesty –
 * zabraňuje tomu, aby /invoices aktivovalo také /invoices/statistics.
 */
export function SidebarLink({ to, icon: Icon, label, exact = false, onClick }) {
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

/**
 * Speciální odkaz pro sekci Faktury.
 * Aktivuje se pro všechny cesty /invoices/* kromě /invoices/statistics,
 * která má vlastní položku v navigaci.
 */
export function SidebarLinkInvoices({ onClick }) {
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

/** Odkaz na Nastavení se zvýrazněním aktivního stavu. */
export function SettingsLink({ onClick }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith("/settings");

  return (
    <Link
      to="/settings"
      className={`sidebar-link sidebar-utility-link${isActive ? " active" : ""}`}
      onClick={onClick}
    >
      <span className="link-icon"><Settings size={17} /></span>
      <span className="link-label">Nastavení</span>
    </Link>
  );
}
