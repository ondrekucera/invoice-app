const SETTINGS_KEY = "invoice_app_settings";

const DEFAULTS = {
  language:   "cs",
  dateFormat: "cs",
  timeFormat: "24h",
};

/**
 * Načte uživatelská nastavení z localStorage.
 * Při parse chybě (poškozený JSON) tiše vrátí výchozí hodnoty.
 */
export const getSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
};

/** Sloučí nová nastavení s existujícími a uloží je. Vrátí aktualizovaný objekt. */
export const saveSettings = (partial) => {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

/** Zkratka pro čtení jedné hodnoty nastavení. */
export const getSetting = (key) => getSettings()[key];
