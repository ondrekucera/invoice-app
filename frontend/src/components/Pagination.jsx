import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Sdílená paginační komponenta.
 *
 * Props:
 *   total      – celkový počet záznamů (po filtraci)
 *   page       – aktuální stránka (1-based)
 *   pageSize   – počet položek na stránku
 *   onPage     – callback(newPage)
 *   onPageSize – callback(newPageSize)
 */
const Pagination = ({ total, page, pageSize, onPage, onPageSize }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from       = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to         = Math.min(page * pageSize, total);

  return (
    <div className="pagination-bar">
      {/* Info + pageSize výběr */}
      <div className="pagination-info">
        <span className="pagination-range">
          {total === 0
            ? "Žádné záznamy"
            : `Zobrazeno ${from}–${to} z ${total}`}
        </span>

        <label className="pagination-size-label">
          Na stránku:
          <select
            className="pagination-size-select"
            value={pageSize}
            onChange={e => onPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Navigace */}
      {totalPages > 1 && (
        <div className="pagination-nav">
          <button
            className="pagination-btn"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            title="Předchozí stránka"
          >
            <ChevronLeft size={15} />
            <span>Předchozí</span>
          </button>

          <span className="pagination-pages">
            {buildPageNumbers(page, totalPages).map((item, i) =>
              item === "…" ? (
                <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
              ) : (
                <button
                  key={item}
                  className={`pagination-page-btn${item === page ? " active" : ""}`}
                  onClick={() => onPage(item)}
                >
                  {item}
                </button>
              )
            )}
          </span>

          <button
            className="pagination-btn"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            title="Další stránka"
          >
            <span>Další</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Generuje pole čísel stránek s případnými "…" pro velké počty stránek.
 * Příklad pro 10 stran, aktuální 5: [1, "…", 4, 5, 6, "…", 10]
 */
function buildPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export default Pagination;
