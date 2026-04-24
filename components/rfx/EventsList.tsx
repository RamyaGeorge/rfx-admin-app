"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TypeBadge, StatusBadge } from "./shared";
import { Plus, PenLine, Star } from "lucide-react";
import type { RFXEvent, EventStatus } from "@/lib/rfx-types";
import { cn } from "@/lib/utils";

const FILTER_TABS: { key: "ALL" | EventStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PUBLISHED", label: "Published" },
  { key: "OPEN", label: "Open" },
  { key: "UNDER_EVALUATION", label: "Under Evaluation" },
  { key: "AWARDED", label: "Awarded" },
];

interface EventsListProps {
  events: RFXEvent[];
  starredIds: Set<number>;
  onToggleStar: (id: number) => void;
  onCreateEvent: () => void;
  onViewEvent: (id: number) => void;
  onEvaluateEvent: (id: number) => void;
  onEditDraft: (id: number) => void;
}

export function EventsList({ events, starredIds, onToggleStar, onCreateEvent, onViewEvent, onEvaluateEvent, onEditDraft }: EventsListProps) {
  const [filter, setFilter] = useState<"ALL" | EventStatus>("ALL");

  const filtered = filter === "ALL" ? events : events.filter((e) => e.status === filter);

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

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-4">
        {FILTER_TABS.map((t) => {
          const cnt = t.key === "ALL" ? events.length : events.filter((e) => e.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "px-4 py-2.5 text-[13px] cursor-pointer border-b-2 mb-[-1px] transition-all",
                filter === t.key
                  ? "text-sky-600 border-sky-500 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              )}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                {cnt}
              </span>
            </button>
          );
        })}
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
                  <div className="flex gap-2.5 mt-1 text-[11px] text-slate-400 flex-wrap">
                    <span>{ev.number}</span>
                    {ev.deadline !== "—" ? (
                      <span>Deadline: {ev.deadline}</span>
                    ) : (
                      <span className="text-slate-300">Deadline not set</span>
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

                {/* Star */}
                <button
                  onClick={e => { e.stopPropagation(); onToggleStar(ev.id); }}
                  className="flex-shrink-0 p-1 rounded hover:bg-amber-50 transition-colors"
                  title={starredIds.has(ev.id) ? "Unstar" : "Star"}
                >
                  <Star size={15} className={starredIds.has(ev.id) ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-amber-300"} />
                </button>

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
