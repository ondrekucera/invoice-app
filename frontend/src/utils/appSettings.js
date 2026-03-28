const SETTINGS_KEY = "invoice_app_settings";

const DEFAULTS = {
  language:   "cs",
  dateFormat: "cs",
  timeFormat: "24h",
};

export const getSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveSettings = (partial) => {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const getSetting = (key) => getSettings()[key];
