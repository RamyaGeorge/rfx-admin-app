"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TypeBadge, StatusBadge } from "./shared";
import { Plus, PenLine, Search, X, ChevronDown } from "lucide-react";
import type { RFXEvent, EventStatus, EventType } from "@/lib/rfx-types";
import { cn } from "@/lib/utils";

const FILTER_TABS: { key: "ALL" | EventStatus; label: string }[] = [
  { key: "ALL",             label: "All" },
  { key: "DRAFT",           label: "Drafts" },
  { key: "PUBLISHED",       label: "Published" },
  { key: "OPEN",            label: "Open" },
  { key: "UNDER_EVALUATION",label: "Under Evaluation" },
  { key: "AWARDED",         label: "Awarded" },
];

const EVENT_TYPES: EventType[] = ["RFI", "RFP", "RFQ"];

function DropdownFilter({ label, value, options, onChange, active }: {
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (key: string) => void;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggle() {
    if (!open) setRect(btnRef.current?.getBoundingClientRect() ?? null);
    setOpen(o => !o);
  }

  const selected = options.find(o => o.key === value);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className={cn(
          "flex items-center gap-1.5 h-8 pl-3 pr-2.5 border rounded-lg text-[12px] cursor-pointer transition-all bg-white",
          active ? "border-primary text-primary font-semibold" : "border-slate-200 text-slate-600 hover:border-slate-300"
        )}
      >
        {active && selected ? selected.label : label}
        <ChevronDown size={12} className={cn("transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
      {open && rect && (
        <div
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, minWidth: Math.max(rect.width, 190), zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-max max-w-[260px]"
        >
          {options.map(o => (
            <button
              key={o.key}
              onMouseDown={e => { e.preventDefault(); onChange(o.key); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-[12px] transition-colors",
                value === o.key ? "bg-primary/5 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

interface EventsListProps {
  events: RFXEvent[];
  onCreateEvent: () => void;
  onViewEvent: (id: number) => void;
  onEvaluateEvent: (id: number) => void;
  onEditDraft: (id: number) => void;
}

export function EventsList({ events, onCreateEvent, onViewEvent, onEvaluateEvent, onEditDraft }: EventsListProps) {
  const [statusFilter,   setStatusFilter]   = useState<"ALL" | EventStatus>("ALL");
  const [typeFilter,     setTypeFilter]     = useState<EventType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search,         setSearch]         = useState("");

  // Derive unique categories from events
  const categories = useMemo(() => {
    const cats = events.map(e => e.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [events]);

  const activeFilterCount =
    (typeFilter !== "ALL" ? 1 : 0) +
    (categoryFilter !== "ALL" ? 1 : 0) +
    (search ? 1 : 0);

  const filtered = useMemo(() => {
    let list = statusFilter === "ALL" ? events : events.filter(e => e.status === statusFilter);
    if (typeFilter !== "ALL")     list = list.filter(e => e.type === typeFilter);
    if (categoryFilter !== "ALL") list = list.filter(e => e.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.number.toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, statusFilter, typeFilter, categoryFilter, search]);

  function clearFilters() {
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setSearch("");
  }

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Events</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">All procurement events</p>
        </div>
        <Button onClick={onCreateEvent} size="sm" className="gap-1.5">
          <Plus size={13} /> Create event
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-4">
        {FILTER_TABS.map((t) => {
          const cnt = t.key === "ALL" ? events.length : events.filter(e => e.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={cn(
                "px-4 py-2.5 text-[13px] cursor-pointer border-b-2 mb-[-1px] transition-all",
                statusFilter === t.key
                  ? "text-sky-600 border-sky-500 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              )}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Search + secondary filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or reference…"
            className="w-full pl-8 pr-8 h-8 border border-slate-200 rounded-lg text-[12px] text-slate-700 placeholder:text-slate-400 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Event type filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 h-8">
          <span className="text-[11px] text-slate-400 px-1.5 font-medium">Type:</span>
          {(["ALL", ...EVENT_TYPES] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                typeFilter === t
                  ? "bg-primary text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {t === "ALL" ? "All" : t}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <DropdownFilter
          label="All categories"
          value={categoryFilter}
          options={[
            { key: "ALL", label: "All categories" },
            ...categories.map(c => ({ key: c, label: c })),
          ]}
          onChange={setCategoryFilter}
          active={categoryFilter !== "ALL"}
        />

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-8 px-3 text-[12px] text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-lg transition-all bg-white"
          >
            <X size={12} /> Clear filters
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-[12px] text-slate-400">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Event rows */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-[13px]">No events in this status.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((ev) => {
            const isDraft = ev.status === "DRAFT";
            const isCancelled = ev.status === "CANCELLED";
            return (
              <div
                key={ev.id}
                onClick={() => isDraft ? onEditDraft(ev.id) : ev.status === "UNDER_EVALUATION" ? onEvaluateEvent(ev.id) : onViewEvent(ev.id)}
                className={cn(
                  "bg-white border border-slate-200 border-l-[4px] rounded-xl px-5 py-4 flex items-center gap-3.5 cursor-pointer transition-all hover:border-slate-300 hover:shadow-md",
                  ev.status === "DRAFT" ? "border-l-slate-300 opacity-85" :
                  ev.status === "PUBLISHED" ? "border-l-sky-400" :
                  ev.status === "OPEN" ? "border-l-emerald-400" :
                  ev.status === "UNDER_EVALUATION" ? "border-l-amber-400" :
                  ev.status === "AWARDED" ? "border-l-indigo-400" :
                  ev.status === "CANCELLED" ? "border-l-red-300 opacity-55" : "border-l-slate-200"
                )}
              >
                {/* Type badge */}
                <TypeBadge type={ev.type} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-slate-900 truncate">
                    {ev.title}
                    {isDraft && (
                      <span className="ml-2 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-medium align-middle">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2.5 mt-1 text-[11px] text-slate-400 flex-wrap items-center">
                    <span>{ev.number}</span>
                    {ev.deadline !== "—" ? (
                      <span>Deadline: {ev.deadline}</span>
                    ) : (
                      <span className="text-slate-300">Deadline not set</span>
                    )}
                    {ev.category && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{ev.category}</span>
                    )}
                  </div>
                </div>

                <StatusBadge status={ev.status} />

                {!isDraft && (
                  <>
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-[16px] font-bold text-slate-900">{ev.responses}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Responses</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-[16px] font-bold text-slate-900">{ev.qualified}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Qualified</span>
                    </div>
                  </>
                )}

                {/* Action */}
                <div className="flex gap-1.5 items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isDraft ? (
                    <Button size="sm" variant="outline" onClick={() => onEditDraft(ev.id)} className="gap-1">
                      <PenLine size={12} /> Edit draft
                    </Button>
                  ) : ev.status === "UNDER_EVALUATION" ? (
                    <Button size="sm" onClick={() => onEvaluateEvent(ev.id)}>Evaluate</Button>
                  ) : !isCancelled ? (
                    <Button size="sm" variant="outline" onClick={() => onViewEvent(ev.id)}>View</Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
