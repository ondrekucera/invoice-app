import OkvionLogo from "./OkvionLogo";

/**
 * BrandLogo – brandingová komponenta sidebaru.
 *
 * Logo ptáčka vizuálně zastupuje písmeno "O" – text "KVION" vedle něj
 * tvoří dohromady slovo OKVION. Oba prvky sdílí identický gradient,
 * takže působí jako jeden vizuální celek, ne jako ikonka + label.
 *
 * Props:
 *   size     – výška loga v px (výchozí 32); text se škáluje relativně
 *   collapsed – při sbaleném sidebaru zobrazí pouze logo
 */
export default function BrandLogo({ size = 32, collapsed = false }) {
  // Velikost fontu odvozená od výšky loga – optická rovnováha s kruhem SVG
  // SVG viewBox 100×100, kruh r=34 → průměr kruhu = 68 % výšky → fontem ladíme na ~72 %
  const fontSize = Math.round(size * 0.72);

  return (
    <div className="brand-wordmark" aria-label="Okvion">
      {/* Logo = vizuální "O" – animace živého oka zůstává beze změny */}
      <OkvionLogo size={size} className="brand-wordmark-logo" />

      {/* Text "KVION" – gradient identický s SVG logem, plynulé navázání */}
      {!collapsed && (
        <span
          className="brand-wordmark-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          KVION
        </span>
      )}
    </div>
  );
}
