// Skeleton pro seznam faktur / osob – imituje layout řádků
const SkeletonRow = ({ cols = 5 }) => (
  <div className="skeleton-row">
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className={`skeleton-cell skeleton-cell-${i + 1}`}>
        <div className="skeleton-block" />
        {i === 1 && <div className="skeleton-block skeleton-block-sm" />}
      </div>
    ))}
  </div>
);

const SkeletonList = ({ rows = 7, cols = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </div>
);

export default SkeletonList;
