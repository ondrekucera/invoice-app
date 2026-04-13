import { useState } from "react";
import { Globe, Calendar, Clock, Sun, Moon, Palette } from "lucide-react";
import { getSettings, saveSettings } from "../utils/appSettings";

const SettingsPage = ({ theme, onThemeChange }) => {
  const [settings, setSettings] = useState(getSettings);

  const handleChange = (key, value) => {
    const updated = saveSettings({ [key]: value });
    setSettings(updated);
  };

  const handleTheme = (val) => {
    if (onThemeChange) onThemeChange(val);
  };

  return (
    <div className="settings-page-layout">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Aplikace</div>
          <h1 className="page-title">Nastavení</h1>
          <div className="page-sub">Předvolby aplikace</div>
        </div>
      </div>

      <div className="settings-card-wrap">
        <div className="card settings-card">
        <div className="card-header">
          <span className="card-title">Zobrazení</span>
        </div>

        {/* Téma */}
        <div className="settings-row">
          <div className="settings-row-label">
            <Palette size={15} style={{ color: "var(--color-primary)" }} />
            <div>
              <div className="settings-row-title">Téma</div>
              <div className="settings-row-sub">Barevný režim aplikace</div>
            </div>
          </div>
          <div className="settings-toggle-group">
            <button type="button"
              className={`settings-toggle-btn${theme === "dark" ? " active" : ""}`}
              onClick={() => handleTheme("dark")}
            >
              <Moon size={13} style={{ marginRight: 4 }} />Tmavé
            </button>
            <button type="button"
              className={`settings-toggle-btn${theme === "light" ? " active" : ""}`}
              onClick={() => handleTheme("light")}
            >
              <Sun size={13} style={{ marginRight: 4 }} />Světlé
            </button>
          </div>
        </div>

        {/* Jazyk */}
        <div className="settings-row">
          <div className="settings-row-label">
            <Globe size={15} style={{ color: "var(--color-primary)" }} />
            <div>
              <div className="settings-row-title">Jazyk</div>
              <div className="settings-row-sub">Jazyk rozhraní aplikace</div>
            </div>
          </div>
          <div className="settings-toggle-group">
            {[{ v: "cs", l: "Čeština" }, { v: "en", l: "English" }].map(opt => (
              <button key={opt.v} type="button"
                className={`settings-toggle-btn${settings.language === opt.v ? " active" : ""}`}
                onClick={() => handleChange("language", opt.v)}
              >{opt.l}</button>
            ))}
          </div>
        </div>

        <div className="card-header" style={{ marginTop: "1rem" }}>
          <span className="card-title">Datum a čas</span>
        </div>

        {/* Formát datumu */}
        <div className="settings-row">
          <div className="settings-row-label">
            <Calendar size={15} style={{ color: "var(--color-primary)" }} />
            <div>
              <div className="settings-row-title">Formát datumu</div>
              <div className="settings-row-sub">Jak se zobrazují data v aplikaci</div>
            </div>
          </div>
          <div className="settings-toggle-group">
            {[{ v: "cs", l: "DD.MM.YYYY" }, { v: "iso", l: "YYYY-MM-DD" }].map(opt => (
              <button key={opt.v} type="button"
                className={`settings-toggle-btn${settings.dateFormat === opt.v ? " active" : ""}`}
                onClick={() => handleChange("dateFormat", opt.v)}
              >{opt.l}</button>
            ))}
          </div>
        </div>

        {/* Formát času */}
        <div className="settings-row">
          <div className="settings-row-label">
            <Clock size={15} style={{ color: "var(--color-primary)" }} />
            <div>
              <div className="settings-row-title">Formát času</div>
              <div className="settings-row-sub">Zobrazení hodin v aplikaci</div>
            </div>
          </div>
          <div className="settings-toggle-group">
            {[{ v: "24h", l: "24h" }, { v: "12h", l: "12h" }].map(opt => (
              <button key={opt.v} type="button"
                className={`settings-toggle-btn${(settings.timeFormat || "24h") === opt.v ? " active" : ""}`}
                onClick={() => handleChange("timeFormat", opt.v)}
              >{opt.l}</button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;
