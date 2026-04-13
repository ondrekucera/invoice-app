import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

/**
 * Generický stylovaný dropdown – náhrada za nativní <select>.
 * Dropdown se renderuje přes fixed positioning, aby escapoval
 * overflow:hidden rodičů (filter-bar, card wrappers).
 *
 * Props: options=[{value, label}], value, onChange, size="sm"|"md", placeholder
 */
const CustomSelect = ({ options, value, onChange, size = "sm", placeholder }) => {
  const [open,     setOpen]     = useState(false);
  const [dropPos,  setDropPos]  = useState({ top: 0, left: 0, width: 0, dropUp: false });
  const triggerRef = useRef(null);
  const dropRef    = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  // Vypočítá pozici dropdownu při otevření – fixed positioning escapuje overflow:hidden
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Dropdown je široký aspoň jako trigger, ale ne méně než 120px,
      // aby se vešly i krátké možnosti jako "10" / "Marketing".
      const dropdownWidth = Math.max(rect.width, 120);

      // POZN.: Používáme position: fixed, takže souřadnice se počítají
      // VŮČI VIEWPORTU, ne vůči dokumentu. Žádný window.scrollX/scrollY!

      // Default pozice: pod triggerem, zarovnáno s jeho levým okrajem
      let left = rect.left;
      let top  = rect.bottom + 3;

      // Detekce přetečení doprava: pokud by se dropdown zobrazil mimo
      // viewport, zarovnáme jeho pravý okraj s pravým okrajem triggeru.
      const viewportRight = window.innerWidth - 8; // 8px padding od kraje
      if (left + dropdownWidth > viewportRight) {
        left = Math.max(8, rect.right - dropdownWidth);
      }

      // Detekce přetečení dolů: pokud se dropdown nevejde pod trigger,
      // otevřeme ho NAD trigger místo POD ním (drop-up fallback).
      // Místo odhadu výšky používáme CSS transform translateY(-100%),
      // který posune dropdown přesně o jeho vlastní výšku nahoru.
      const dropdownMaxHeight = 280;
      const viewportBottom = window.innerHeight - 8;
      let dropUp = false;
      if (top + dropdownMaxHeight > viewportBottom) {
        top = rect.top - 3; // 3px gap nad triggerem
        dropUp = true;
      }

      setDropPos({ top, left, width: dropdownWidth, dropUp });
    }
    setOpen(o => !o);
  };

  // Zavřít při kliknutí mimo dropdown nebo trigger
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current    && !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`custom-select-wrap custom-select-${size}`}>
      <button
        type="button"
        ref={triggerRef}
        className={`custom-select-trigger${open ? " open" : ""}`}
        onClick={openDropdown}
      >
        <span className="custom-select-value">{selected?.label ?? placeholder ?? value}</span>
        <span className="custom-select-chevron"><ChevronDown size={12} /></span>
      </button>

      {/*
        Dropdown se portaluje přímo do document.body, aby unikl z DOM
        hierarchie. Bez portalu by ho rodič s `transform` (např. animace
        sidebaru) interpretoval jako position: absolute, ne fixed, a
        dropdown by se renderoval na špatném místě.
      */}
      {open && createPortal(
        <div
          ref={dropRef}
          className="custom-select-dropdown custom-select-dropdown--portal"
          style={{
            position: "fixed",
            top:      dropPos.top,
            left:     dropPos.left,
            minWidth: dropPos.width,
            // Drop-up: posun nahoru o vlastní výšku přes CSS transform.
            // Tím se dropdown vždy přesně doseděl k triggeru bez ohledu
            // na počet options (žádný odhad výšky).
            transform: dropPos.dropUp ? "translateY(-100%)" : undefined,
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-select-option${String(opt.value) === String(value) ? " active" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
            >
              <span>{opt.label}</span>
              {String(opt.value) === String(value) && <Check size={12} className="custom-select-check" />}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
