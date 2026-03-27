import { useState, useMemo, useEffect } from "react";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Hook pro frontend stránkování.
 *
 * @param {Array}  items     – celé (filtrované) pole dat
 * @param {*}      resetKey  – libovolná hodnota; při její změně se stránka resetuje na 1
 *                             (předej sem filtr nebo tab, aby se stránka vracela na začátek)
 * @returns {{ page, pageSize, setPage, setPageSize, paginated, total }}
 */
export function usePagination(items, resetKey) {
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* Reset na stránku 1 při změně filtru / tabu / externího klíče */
  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  /* Reset na stránku 1 také při změně pageSize */
  const handleSetPageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const total      = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /*
   * Edge case fix: pokud aktuální stránka přesáhne platný rozsah
   * (např. po smazání záznamu na poslední stránce), automaticky
   * přejdeme na poslední platnou stránku.
   *
   * Podmínka `page > totalPages` zabrání zbytečným re-renderům –
   * setPage se volá jen tehdy, kdy skutečně potřebujeme korekci.
   * Tento efekt je záměrně oddělený od resetKey efektu výše,
   * aby nedocházelo ke vzájemné interferenci.
   */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize: handleSetPageSize,
    paginated,
    total,
  };
}
