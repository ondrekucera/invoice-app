import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { usePageTitle } from "./usePageTitle";
import { getSetting } from "../utils/appSettings";

/**
 * Horní lišta aplikace – zobrazuje název aktuální stránky a živé hodiny.
 * Tlačítko menu je viditelné pouze na mobilních zařízeních (CSS třída menu-btn).
 */
export function TopBar({ onMenuClick }) {
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

/**
 * Živé hodiny v TopBaru – aktualizují se každou sekundu.
 * Formát (12h / 24h) se čte z uživatelského nastavení uloženého v localStorage.
 */
function TopBarClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer); // cleanup zabraňuje memory leaku po unmount
  }, []);

  const timeFormat = getSetting("timeFormat") || "24h";
  const dateStr = now.toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = timeFormat === "12h"
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
