"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  value?: string;           // "YYYY-MM-DDTHH:mm"
  defaultValue?: string;
  onChange?: (val: string) => void;
  className?: string;
  disabled?: boolean;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtDisplay(d: Date, h12: number, min: string, ampm: "AM"|"PM") {
  return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}  •  ${String(h12).padStart(2,"0")}:${min} ${ampm}`;
}

// Convert 24h HH:mm to { h12, min, ampm }
function to12(hh: string, mm: string): { h12: number; min: string; ampm: "AM"|"PM" } {
  const h = parseInt(hh) || 0;
  return {
    h12: h % 12 === 0 ? 12 : h % 12,
    min: mm,
    ampm: h < 12 ? "AM" : "PM",
  };
}
// Convert 12h back to 24h string "HH:mm"
function to24(h12: number, min: string, ampm: "AM"|"PM"): string {
  let h = h12 % 12;
  if (ampm === "PM") h += 12;
  return `${String(h).padStart(2,"0")}:${min}`;
}

export function DateTimePicker({ value, defaultValue, onChange, className, disabled }: DateTimePickerProps) {
  const initial = value ?? defaultValue ?? "";
  const [datePart, setDatePart] = useState(initial.split("T")[0] ?? "");
  const [timePart, setTimePart] = useState(initial.split("T")[1] ?? "12:00");
  const [open, setOpen] = useState(false);
  const [viewYear,  setViewYear]  = useState(() => datePart ? parseInt(datePart.split("-")[0]) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => datePart ? parseInt(datePart.split("-")[1])-1 : new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const [rawH, rawM] = timePart.split(":");
  const { h12, min, ampm } = to12(rawH, rawM);

  // sync if controlled value changes
  useEffect(() => {
    if (value) {
      setDatePart(value.split("T")[0] ?? "");
      setTimePart(value.split("T")[1] ?? "12:00");
    }
  }, [value]);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function emit(d: string, t: string) {
    onChange?.(`${d}T${t}`);
  }

  function selectDate(d: Date) {
    const ds = fmt(d);
    setDatePart(ds);
    emit(ds, timePart);
  }

  function setHour(newH12: number) {
    const clamped = Math.max(1, Math.min(12, newH12 || 12));
    const t = to24(clamped, min, ampm);
    setTimePart(t);
    emit(datePart || fmt(new Date()), t);
  }

  function setMinute(newM: number) {
    const clamped = Math.max(0, Math.min(59, isNaN(newM) ? 0 : newM));
    const mm = String(clamped).padStart(2,"0");
    const t = to24(h12, mm, ampm);
    setTimePart(t);
    emit(datePart || fmt(new Date()), t);
  }

  function toggleAmPm() {
    const newAmpm: "AM"|"PM" = ampm === "AM" ? "PM" : "AM";
    const t = to24(h12, min, newAmpm);
    setTimePart(t);
    emit(datePart || fmt(new Date()), t);
  }

  // calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells: (number|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({length: daysInMonth}, (_, i) => i+1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  }

  const selectedDate = datePart ? new Date(datePart + "T00:00") : null;

  const displayText = selectedDate
    ? fmtDisplay(selectedDate, h12, min, ampm)
    : "Select date & time";

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-input bg-white text-[13px] text-left transition-all",
          "hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
          open && "ring-2 ring-ring/50 border-ring",
          disabled && "opacity-50 pointer-events-none",
          !selectedDate && "text-slate-400"
        )}
      >
        <Calendar size={14} className="text-slate-400 flex-shrink-0" />
        <span className="flex-1 truncate">{displayText}</span>
        <Clock size={13} className="text-slate-400 flex-shrink-0" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 left-0 min-w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

          {/* Calendar header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 transition-colors">
              <ChevronLeft size={14} className="text-slate-500" />
            </button>
            <span className="text-[13px] font-semibold text-slate-700">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 transition-colors">
              <ChevronRight size={14} className="text-slate-500" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)"}} className="px-3 pt-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 pb-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)"}} className="px-3 pb-2">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const thisDate = new Date(viewYear, viewMonth, day);
              const ds = fmt(thisDate);
              const isSelected = ds === datePart;
              const isToday = ds === fmt(new Date());
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(thisDate)}
                  className={cn(
                    "mx-auto flex items-center justify-center w-7 h-7 rounded-full text-[12px] transition-colors",
                    isSelected && "bg-primary text-white font-semibold",
                    !isSelected && isToday && "border border-primary text-primary font-medium",
                    !isSelected && !isToday && "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50">
            <Clock size={14} className="text-slate-400 flex-shrink-0" />
            <span className="text-[12px] font-medium text-slate-600">Time</span>
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="number" min={1} max={12} value={h12}
                onChange={e => setHour(parseInt(e.target.value))}
                className="w-10 h-8 text-center text-[13px] font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <span className="text-[14px] font-bold text-slate-400">:</span>
              <input
                type="number" min={0} max={59} value={min}
                onChange={e => setMinute(parseInt(e.target.value))}
                className="w-10 h-8 text-center text-[13px] font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button
                type="button"
                onClick={toggleAmPm}
                className="h-8 px-2 text-[12px] font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-100 transition-colors text-slate-700 min-w-[38px]"
              >
                {ampm}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
