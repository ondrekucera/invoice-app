import { useState, useMemo, useEffect } from "react";

const DEFAULT_PAGE_SIZE = 15;

/**
 * Spravuje stav stránkování pro libovolný seznam položek.
 *
 * @param {Array}  items    - Kompletní seznam všech položek (před stránkováním)
 * @param {string} resetKey - Při změně tohoto klíče se stránka resetuje na 1
 *                            (typicky složený string z filtrů a aktivní záložky)
 * @returns Stav stránkování a aktuální slice položek
 */
export function usePagination(items, resetKey) {
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Reset na první stránku při změně filtrů nebo přepnutí záložky
  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const total     = items.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, pageSize, setPage, setPageSize, paginated, total };
}
