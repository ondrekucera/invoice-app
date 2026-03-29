import { useLocation } from "react-router-dom";

/**
 * Vrátí český název aktuální stránky pro zobrazení v TopBaru.
 * Pořadí podmínek záleží – specifičtější cesty musí být před obecnějšími
 * (např. /invoices/statistics před /invoices).
 */
export function usePageTitle() {
  const { pathname } = useLocation();

  if (pathname === "/" || pathname === "/home")    return "Přehled";
  if (pathname.startsWith("/persons/create"))      return "Nová osoba";
  if (/\/persons\/edit\//.test(pathname))          return "Upravit osobu";
  if (/\/persons\/show\//.test(pathname))          return "Detail osoby";
  if (pathname.startsWith("/persons"))             return "Osoby";
  if (pathname.startsWith("/invoices/statistics")) return "Statistiky";
  if (pathname.startsWith("/invoices/create"))     return "Nová faktura";
  if (/\/invoices\/edit\//.test(pathname))         return "Upravit fakturu";
  if (/\/invoices\/show\//.test(pathname))         return "Detail faktury";
  if (pathname.startsWith("/invoices"))            return "Faktury";
  if (pathname.startsWith("/settings"))            return "Nastavení";

  return "Okvion";
}
