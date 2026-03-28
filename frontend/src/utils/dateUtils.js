// Převod CZ formátu DD.MM.YYYY (nebo D.M.YYYY) na ISO YYYY-MM-DD
export const czToIso = (str) => {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split(".");
  if (parts.length !== 3) return str;
  const [d, m, y] = parts;
  if (!d || !m || !y) return str;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// Převod ISO YYYY-MM-DD na CZ formát DD.MM.YYYY
export const isoToCz = (str) => {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}.${m}.${y}`;
  }
  return str;
};

// Přesná validace datumu – kontroluje den/měsíc/rok a reálné datum (ne jen parsování)
export const isValidDate = (str) => {
  const iso = czToIso(str);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  if (y < 1900 || y > 2200) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Ověří reálné datum – eliminuje 31.02, 31.04 atd.
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

// Normalizace CZ vstupu – doplní nuly: "1.3.2026" → "01.03.2026"
export const normalizeCzDate = (str) => {
  if (!str) return "";
  const parts = str.split(".");
  if (parts.length !== 3) return str;
  const [d, m, y] = parts;
  return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`;
};

// Normalizace ISO vstupu – doplní nuly: "2026-3-1" → "2026-03-01"
export const normalizeIsoDate = (str) => {
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  const [y, m, d] = parts;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// Pokus o parsování ISO vstupu (YYYY-MM-DD) zpět na ISO (pro ISO mode)
export const isoInputToIso = (str) => {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Pokus o částečný zápis YYYY-M-D
  const parts = str.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return str;
};
