import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
];

const Pagination = ({ total, page, pageSize, onPage, onPageSize }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from       = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to         = Math.min(page * pageSize, total);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span className="pagination-range">
          {total === 0 ? "Žádné záznamy" : `Zobrazeno ${from}–${to} z ${total}`}
        </span>
        <label className="pagination-size-label">
          Na stránku:
          <CustomSelect
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={(v) => onPageSize(Number(v))}
            size="sm"
          />
        </label>
      </div>

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
