import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// Generický stylovaný dropdown – náhrada za basic <select>
// Props: options=[{value, label}], value, onChange, size="sm"|"md"
const CustomSelect = ({ options, value, onChange, size = "sm" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`custom-select-wrap custom-select-${size}`} ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="custom-select-value">{selected?.label ?? value}</span>
        <span className="custom-select-chevron"><ChevronDown size={12} /></span>
      </button>

      {open && (
        <div className="custom-select-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-select-option${String(opt.value) === String(value) ? " active" : ""}`}
              onClick={() => handleSelect(opt.value)}
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
