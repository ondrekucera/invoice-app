/**
 * Formátuje číslo jako české locale celé číslo (např. 1 234 567).
 * Používá se konzistentně v tabulkách faktur, detailech a statistikách.
 * Výchozí hodnota 0 chrání před NaN při zobrazení null/undefined z API.
 */
export const formatCurrency = (value) =>
  Number(value ?? 0).toLocaleString("cs-CZ");
