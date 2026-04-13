import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  czToIso, isoToCz, normalizeCzDate,
  normalizeIsoDate, isoInputToIso, isValidDate
} from "../utils/dateUtils";
import { getSetting } from "../utils/appSettings";

const MONTHS = ["Leden","Únor","Březen","Duben","Květen","Červen",
                "Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];
const DAYS   = ["Po","Út","St","Čt","Pá","So","Ne"];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

// Převede ISO interní hodnotu na zobrazovací string dle nastaveného formátu
const toDisplay = (isoValue, fmt) => {
  if (!isoValue) return "";
  return fmt === "iso" ? isoValue : isoToCz(isoValue);
};

// Pokusí se převést vstup uživatele (v daném formátu) zpět na ISO
const fromDisplay = (displayStr, fmt) => {
  if (!displayStr) return "";
  if (fmt === "iso") return isoInputToIso(displayStr);
  return czToIso(displayStr);
};

// Normalizuje zobrazovací hodnotu (doplní nuly) dle formátu
const normalizeDisplay = (displayStr, fmt) => {
  if (!displayStr) return "";
  if (fmt === "iso") return normalizeIsoDate(displayStr);
  return normalizeCzDate(displayStr);
};

const DateInput = ({ label, value, onChange, required, fieldError }) => {
  const fmt = getSetting("dateFormat") || "cs";
  const placeholder = fmt === "iso" ? "RRRR-MM-DD" : "DD.MM.RRRR";

  const [displayValue, setDisplayValue] = useState(toDisplay(value, fmt));
  const [calendarOpen, setCalendarOpen]  = useState(false);

  const initDate  = value ? new Date(value) : new Date();
  const [calYear,  setCalYear]  = useState(initDate.getFullYear());
  const [calMonth, setCalMonth] = useState(initDate.getMonth());

  const ref = useRef(null);

  // Synchronizace display hodnoty při změně externího value nebo formátu
  useEffect(() => {
    setDisplayValue(toDisplay(value, fmt));
  }, [value, fmt]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setCalendarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitValue = (displayStr) => {
    const iso = fromDisplay(displayStr, fmt);
    if (iso && isValidDate(iso)) {
      onChange(iso);
    } else {
      onChange("");
    }
  };

  const handleInputChange = (e) => {
    setDisplayValue(e.target.value);
  };

  const handleBlur = () => {
    if (!displayValue) { onChange(""); return; }
    const normalized = normalizeDisplay(displayValue, fmt);
    setDisplayValue(normalized);
    commitValue(normalized);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" || e.key === "Enter") {
      if (displayValue) {
        const normalized = normalizeDisplay(displayValue, fmt);
        setDisplayValue(normalized);
        commitValue(normalized);
      }
    }
  };

  const handleDayClick = (day) => {
    const iso = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(iso);
    setDisplayValue(toDisplay(iso, fmt));
    setCalendarOpen(false);
  };

  const buildDays = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const offset   = firstDay === 0 ? 6 : firstDay - 1;
    const total    = new Date(calYear, calMonth + 1, 0).getDate();
    const cells    = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  };

  const selectedDay   = value ? new Date(value).getDate() : null;
  const selectedMonth = value ? new Date(value).getMonth() : null;
  const selectedYear  = value ? new Date(value).getFullYear() : null;
  const todayStr      = todayIso();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required ? " *" : ""}</label>}
      <div className="date-input-wrap" ref={ref}>
        <div className="date-input-row">
          <input
            className={`form-input date-input${calendarOpen ? " focused" : ""}${fieldError ? " input-error" : ""}`}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
          />
          <button
            type="button"
            className={`date-cal-btn${calendarOpen ? " open" : ""}`}
            onClick={() => {
              if (!calendarOpen && value) {
                const d = new Date(value);
                setCalYear(d.getFullYear());
                setCalMonth(d.getMonth());
              }
              setCalendarOpen(o => !o);
            }}
            tabIndex={-1}
          >
            <Calendar size={15} />
          </button>
        </div>
        {fieldError && <div className="field-error">{fieldError}</div>}

        {calendarOpen && (
          <div className="date-calendar">
            <div className="date-cal-header">
              <button type="button" className="date-cal-nav" onClick={prevMonth}>
                <ChevronLeft size={14} />
              </button>
              <span className="date-cal-title">{MONTHS[calMonth]} {calYear}</span>
              <button type="button" className="date-cal-nav" onClick={nextMonth}>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="date-cal-grid">
              {DAYS.map(d => (
                <div key={d} className="date-cal-day-name">{d}</div>
              ))}
              {buildDays().map((day, i) => {
                if (!day) return <div key={`e${i}`} />;
                const isSelected = day === selectedDay && calMonth === selectedMonth && calYear === selectedYear;
                const isToday    = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` === todayStr;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`date-cal-day${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateInput;
