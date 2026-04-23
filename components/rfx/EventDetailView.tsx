"use client";

import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import { Users, FileText, MessageSquare, BarChart2, ArrowRight, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveEvent, AppView } from "@/lib/rfx-types";
import type { SupplierResponse, Clarification } from "@/lib/rfx-types";

interface EventDetailViewProps {
  event: ActiveEvent;
  responses: SupplierResponse[];
  clarifications: Clarification[];
  onNavigate: (view: AppView) => void;
  onViewEvent: () => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400 w-40 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-slate-800 text-right flex-1">{value}</span>
    </div>
  );
}

function StatTile({ icon, label, value, sub, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-4 text-left transition-all",
        onClick ? "hover:border-primary/40 hover:shadow-sm cursor-pointer group" : "cursor-default"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        {onClick && (
          <ArrowRight size={13} className="text-slate-300 group-hover:text-primary transition-colors" />
        )}
      </div>
      <div className="text-[22px] font-bold text-slate-900">{value}</div>
      <div className="text-[12px] font-medium text-slate-600 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </button>
  );
}

const STATUS_ACTIONS: Partial<Record<string, { label: string; view: AppView }>> = {
  OPEN:             { label: "View responses", view: "responses" },
  UNDER_EVALUATION: { label: "Evaluate suppliers", view: "responses" },
  AWARDED:          { label: "View award details", view: "responses" },
};

export function EventDetailView({ event, responses, clarifications, onNavigate, onViewEvent }: EventDetailViewProps) {
  const submitted     = responses.filter(r => r.status === "SUBMITTED").length;
  const qualified     = responses.filter(r => !r.is_disqualified).length;
  const pendingClarif = clarifications.filter(c => c.status === "PENDING").length;
  const action = STATUS_ACTIONS[event.status];

  return (
    <div className="p-7 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <TypeBadge type={event.type} />
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-snug">{event.title}</h1>
          <p className="text-[12px] text-slate-400 mt-1">{event.number}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onViewEvent}
            className="gap-1.5"
          >
            <ScrollText size={13} /> View event
          </Button>
          {action && (
            <Button
              onClick={() => onNavigate(action.view)}
              className="gap-1.5"
            >
              {action.label} <ArrowRight size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Stat tiles — full width 4 col */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatTile
          icon={<Users size={16} />}
          label="Responses"
          value={submitted}
          sub={`${qualified} qualified`}
          onClick={submitted > 0 ? () => onNavigate("responses") : undefined}
        />
        <StatTile
          icon={<MessageSquare size={16} />}
          label="Clarifications"
          value={clarifications.length}
          sub={pendingClarif > 0 ? `${pendingClarif} pending` : "All answered"}
          onClick={clarifications.length > 0 ? () => onNavigate("clarif") : undefined}
        />
        <StatTile
          icon={<BarChart2 size={16} />}
          label="Qualified"
          value={qualified}
          sub={`Min. score ${event.min_qual_score}%`}
        />
        <StatTile
          icon={<FileText size={16} />}
          label="Event type"
          value={event.type}
          sub={event.two_envelope ? "Two-envelope" : "Single envelope"}
        />
      </div>

      {/* Lower panels — stretch to fill remaining height */}
      <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
        {/* Left — Event details */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Event details</div>
            <div className="bg-white border border-slate-200 rounded-xl px-4">
              <InfoRow label="Reference number"      value={event.number} />
              <InfoRow label="Event type"            value={event.type} />
              <InfoRow label="Submission deadline"   value={event.deadline} />
              <InfoRow label="Status"                value={<StatusBadge status={event.status} />} />
              <InfoRow label="Min. qualification score" value={`${event.min_qual_score}%`} />
            </div>
          </div>

          {/* Quick access */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick access</div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "Responses",         view: "responses" as AppView, count: submitted },
                { label: "Q&A / Clarifications", view: "clarif" as AppView, count: clarifications.length },
              ] as const).map(({ label, view, count }) => (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span className="text-[13px] font-medium text-slate-700 group-hover:text-primary transition-colors">{label}</span>
                  <span className="text-[15px] font-bold text-slate-500">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Timeline + envelope */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {event.two_envelope ? "Two-envelope schedule" : "Timeline"}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4">
              {event.two_envelope ? (
                <>
                  <InfoRow
                    label="Technical opening"
                    value={
                      <span className={cn(
                        "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                        event.tech_phase === "OPENED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {event.tech_opening} · {event.tech_phase}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Financial opening"
                    value={
                      <span className={cn(
                        "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                        event.fin_phase === "OPENED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
                      )}>
                        {event.fin_opening} · {event.fin_phase}
                      </span>
                    }
                  />
                </>
              ) : (
                <InfoRow label="System" value="Single envelope — combined technical & financial" />
              )}
              <InfoRow label="Submission deadline" value={event.deadline} />
            </div>
          </div>

          {/* Supplier response summary */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Supplier summary</div>
            <div className="bg-white border border-slate-200 rounded-xl px-4">
              <InfoRow label="Total responses"  value={submitted} />
              <InfoRow label="Qualified"        value={qualified} />
              <InfoRow label="Disqualified"     value={responses.filter(r => r.is_disqualified).length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
