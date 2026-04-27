"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import { Users, FileText, MessageSquare, BarChart2, ArrowRight, ScrollText, CalendarClock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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

/* ── Deadline Extension Modal ─────────────────────────────────────── */
function DeadlineExtensionModal({
  responses,
  currentDeadline,
  onClose,
  onApply,
}: {
  responses: SupplierResponse[];
  currentDeadline: string;
  onClose: () => void;
  onApply: (newDeadline: string, supplierIds: number[] | "all", note: string) => void;
}) {
  const [scope, setScope]       = useState<"all" | "specific">("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [newDeadline, setNewDeadline] = useState(currentDeadline);
  const [note, setNote]         = useState("");
  const [done, setDone]         = useState(false);

  function toggleSupplier(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function handleApply() {
    if (!newDeadline) return;
    if (scope === "specific" && selected.length === 0) return;
    onApply(newDeadline, scope === "all" ? "all" : selected, note);
    setDone(true);
  }

  const canApply = newDeadline && (scope === "all" || selected.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl w-[500px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarClock size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-slate-900">Extend deadline</div>
              <div className="text-[11px] text-slate-400">Current: {currentDeadline}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={28} className="text-emerald-600" />
            </div>
            <p className="text-[14px] font-semibold text-slate-900">Deadline extended</p>
            <p className="text-[12px] text-slate-500 text-center">
              {scope === "all" ? "All suppliers" : `${selected.length} supplier(s)`} notified with new deadline <strong>{newDeadline}</strong>.
            </p>
            <Button onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* New deadline */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  New deadline <span className="text-red-400">*</span>
                </label>
                <DateTimePicker value={newDeadline} onChange={setNewDeadline} />
              </div>

              {/* Scope */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Apply to
                </label>
                <div className="flex gap-2">
                  {(["all", "specific"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setScope(opt)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-[12px] font-semibold transition-all",
                        scope === opt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {opt === "all" ? "All suppliers" : "Specific suppliers"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier checklist */}
              {scope === "specific" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Select suppliers <span className="text-red-400">*</span>
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {responses.map(r => (
                      <label
                        key={r.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            selected.includes(r.id) ? "bg-primary border-primary" : "border-slate-300 bg-white"
                          )}
                          onClick={() => toggleSupplier(r.id)}
                        >
                          {selected.includes(r.id) && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-slate-800">{r.supplier}</span>
                          <span className="text-[11px] text-slate-400 ml-2">{r.country}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                          r.status === "SUBMITTED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {r.status}
                        </span>
                      </label>
                    ))}
                  </div>
                  {selected.length === 0 && (
                    <p className="text-[11px] text-red-400 mt-1">Select at least one supplier.</p>
                  )}
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Note to suppliers <span className="text-slate-300">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Reason for the extension…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={onClose} className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </button>
              <Button onClick={handleApply} disabled={!canApply}>
                <CalendarClock size={14} /> Extend deadline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
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
  const [extOpen, setExtOpen] = useState(false);

  return (
    <>
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
          {(event.status === "OPEN" || event.status === "PUBLISHED") && (
            <Button variant="outline" onClick={() => setExtOpen(true)} className="gap-1.5">
              <CalendarClock size={13} /> Extend deadline
            </Button>
          )}
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

    {extOpen && (
      <DeadlineExtensionModal
        responses={responses}
        currentDeadline={event.deadline}
        onClose={() => setExtOpen(false)}
        onApply={(_newDeadline, _supplierIds, _note) => {
          // In a real app: call API to persist, notify suppliers, update event deadline
        }}
      />
    )}
  </>
  );
}
