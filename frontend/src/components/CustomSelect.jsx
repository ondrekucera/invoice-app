import React, { useState, useRef, useEffect } from "react";
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
  const [dropPos,  setDropPos]  = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef    = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  // Vypočítá pozici dropdownu při otevření – fixed positioning escapuje overflow:hidden
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({
        top:   rect.bottom + window.scrollY + 3,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      });
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

      {open && (
        <div
          ref={dropRef}
          className="custom-select-dropdown custom-select-dropdown--portal"
          style={{
            position: "fixed",
            top:      dropPos.top,
            left:     dropPos.left,
            minWidth: dropPos.width,
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
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
