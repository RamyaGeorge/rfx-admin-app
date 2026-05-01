"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import {
  ChevronLeft, FileText, List, Users, HelpCircle, ArrowRight,
  CalendarClock, X, Check, Paperclip, Download, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import type { ActiveEvent, SupplierResponse, WizSection, WizItem, WizParticipant, WizDocument, DocumentType } from "@/lib/rfx-types";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  TERMS_CONDITIONS: "Terms & Conditions",
  NDA: "NDA",
  OTHER: "Other",
};

interface EventPreviewViewProps {
  event: ActiveEvent;
  responses: SupplierResponse[];
  sections: WizSection[];
  items: WizItem[];
  participants: WizParticipant[];
  documents: WizDocument[];
  onBack: () => void;
  onViewResponses: () => void;
}

type Tab = "overview" | "questionnaire" | "boq" | "participants" | "documents";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview",      label: "Overview",      icon: <FileText size={13} /> },
  { key: "questionnaire", label: "Questionnaire",  icon: <HelpCircle size={13} /> },
  { key: "boq",           label: "Bid Matrix",     icon: <List size={13} /> },
  { key: "participants",  label: "Suppliers",      icon: <Users size={13} /> },
  { key: "documents",     label: "Documents",      icon: <Paperclip size={13} /> },
];

const QTYPE_LABELS: Record<string, string> = {
  TEXT: "Text", NUMERIC: "Numeric", BOOLEAN: "Boolean",
  SINGLE_CHOICE: "Single Choice", MULTI_CHOICE: "Multi Choice",
  FILE_UPLOAD: "File Upload", DATE: "Date",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-5 first:mt-0">
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400 w-44 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-slate-800 text-right flex-1">{value}</span>
    </div>
  );
}

/* ── Deadline Extension Modal ─────────────────────────────────────── */
function toIsoDeadline(val: string): string {
  // Already ISO format "YYYY-MM-DDTHH:mm"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) return val.slice(0, 16);
  // Try parsing freeform like "15 Oct 2025"
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00`;
  }
  // Fallback: one month from today
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  return now.toISOString().slice(0, 16);
}

function DeadlineExtensionModal({
  participants,
  currentDeadline,
  onClose,
  onApply,
}: {
  participants: WizParticipant[];
  currentDeadline: string;
  onClose: () => void;
  onApply: (newDeadline: string, scope: "all" | "specific") => void;
}) {
  const isoDeadline = toIsoDeadline(currentDeadline);
  const [scope, setScope]             = useState<"all" | "specific">("all");
  const [selected, setSelected]       = useState<number[]>([]);
  const [newDeadline, setNewDeadline] = useState(isoDeadline);
  const [note, setNote]               = useState("");
  const [done, setDone]               = useState(false);

  function toggleSupplier(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function handleApply() {
    if (!newDeadline) return;
    if (scope === "specific" && selected.length === 0) return;
    onApply(newDeadline, scope);
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
                    {participants.map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            selected.includes(p.id) ? "bg-primary border-primary" : "border-slate-300 bg-white"
                          )}
                          onClick={() => toggleSupplier(p.id)}
                        >
                          {selected.includes(p.id) && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-slate-800">{p.name}</span>
                          <span className="text-[11px] text-slate-400 ml-2">{p.country}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                          p.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {p.status}
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
              <Button onClick={handleApply} disabled={!canApply} className="gap-1.5">
                <CalendarClock size={14} /> Extend deadline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function EventPreviewView({ event, responses, sections, items, participants, documents, onBack, onViewResponses }: EventPreviewViewProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [extOpen, setExtOpen] = useState(false);
  const [extendedDeadline, setExtendedDeadline] = useState<string | null>(null);

  const totalQ = sections.reduce((n, s) => n + s.questions.length, 0);
  const canExtend = event.status === "OPEN" || event.status === "PUBLISHED";
  const displayDeadline = extendedDeadline ?? event.deadline;

  return (
    <>
    <div className="flex flex-col h-full bg-[#f0f4f8]">
      {/* Header — full width, matches app topbar height */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        {/* Event title row */}
        <div className="flex items-center justify-between px-7 py-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-700 transition-colors mt-0.5 flex-shrink-0"
            >
              <ChevronLeft size={13} /> Events
            </button>
            <span className="text-slate-200 mt-0.5">›</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TypeBadge type={event.type} />
                <StatusBadge status={event.status} />
              </div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-snug">{event.title}</h1>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                {event.number} · Deadline: {displayDeadline}
                {extendedDeadline && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <CalendarClock size={10} /> Extended
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canExtend && (
              <Button variant="outline" onClick={() => setExtOpen(true)} className="gap-1.5">
                <CalendarClock size={13} /> Extend deadline
              </Button>
            )}
            <Button onClick={onViewResponses} className="gap-1.5">
              View responses <ArrowRight size={13} />
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 px-7 border-t border-slate-100">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-[13px] border-b-2 mb-[-1px] transition-all",
                tab === t.key
                  ? "text-primary border-primary font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-7">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-6 max-w-5xl">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <SectionLabel>Event information</SectionLabel>
                <div className="bg-white border border-slate-200 rounded-xl px-4">
                  <InfoRow label="Event title"         value={event.title} />
                  <InfoRow label="Reference number"    value={event.number} />
                  <InfoRow label="Event type"          value={event.type} />
                  <InfoRow label="Status"              value={<StatusBadge status={event.status} />} />
                  <InfoRow label="Submission deadline" value={
                    <span className="flex items-center gap-2">
                      {displayDeadline}
                      {extendedDeadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <CalendarClock size={10} /> Extended
                        </span>
                      )}
                    </span>
                  } />
                  <InfoRow label="Min. qual. score"    value={`${event.min_qual_score}%`} />
                </div>
              </div>
              <div>
                <SectionLabel>Questionnaire summary</SectionLabel>
                <div className="bg-white border border-slate-200 rounded-xl px-4">
                  <InfoRow label="Sections"     value={sections.length} />
                  <InfoRow label="Questions"    value={totalQ} />
                  <InfoRow label="Line items"   value={items.length} />
                  <InfoRow label="Participants" value={participants.length} />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <SectionLabel>Envelope configuration</SectionLabel>
                <div className="bg-white border border-slate-200 rounded-xl px-4">
                  {event.two_envelope ? (
                    <>
                      <InfoRow label="System"            value="Two-envelope" />
                      <InfoRow label="Technical opening" value={`${event.tech_opening} · ${event.tech_phase}`} />
                      <InfoRow label="Financial opening" value={`${event.fin_opening} · ${event.fin_phase}`} />
                    </>
                  ) : (
                    <InfoRow label="System" value="Single envelope — combined technical & financial" />
                  )}
                  <InfoRow label="Submission deadline" value={
                    <span className="flex items-center gap-2">
                      {displayDeadline}
                      {extendedDeadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <CalendarClock size={10} /> Extended
                        </span>
                      )}
                    </span>
                  } />
                </div>
              </div>
              <div>
                <SectionLabel>Supplier responses</SectionLabel>
                <div className="bg-white border border-slate-200 rounded-xl px-4">
                  <InfoRow label="Total responses" value={responses.filter(r => r.status === "SUBMITTED").length} />
                  <InfoRow label="Qualified"       value={responses.filter(r => !r.is_disqualified).length} />
                  <InfoRow label="Disqualified"    value={responses.filter(r => r.is_disqualified).length} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUESTIONNAIRE ── */}
        {tab === "questionnaire" && (
          <div className="space-y-4">
            {sections.length === 0 && (
              <p className="text-[13px] text-slate-400">No questionnaire sections defined.</p>
            )}
            {sections.map(sec => (
              <div key={sec.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="text-[13px] font-semibold text-slate-900">{sec.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">{sec.type}</span>
                  {sec.mandatory && (
                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">Required</span>
                  )}
                  <span className="ml-auto text-[11px] text-slate-400">{sec.questions.length} question{sec.questions.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Questions */}
                <div className="divide-y divide-slate-50">
                  {sec.questions.map((q, qi) => (
                    <div key={q.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-[11px] text-slate-300 font-mono w-5 flex-shrink-0 mt-0.5">{qi + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-800">{q.text}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {QTYPE_LABELS[q.qtype] ?? q.qtype}
                          </span>
                          {q.mandatory && (
                            <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                          )}
                          {q.scored && (
                            <span className="text-[10px] font-medium text-primary bg-primary/8 px-1.5 py-0.5 rounded">
                              Scored · {q.weight ?? 0}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sec.questions.length === 0 && (
                    <p className="text-[12px] text-slate-400 px-4 py-3">No questions in this section.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOQ / LINE ITEMS ── */}
        {tab === "boq" && (
          <div>
            {items.length === 0 ? (
              <p className="text-[13px] text-slate-400">No line items defined for this event.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Code", "Description", "Qty", "Unit", "Target ₹", "Required by"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map(it => (
                      <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{it.item_code}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">{it.description}</td>
                        <td className="px-4 py-3 text-slate-600">{it.quantity}</td>
                        <td className="px-4 py-3 text-slate-500">{it.unit}</td>
                        <td className="px-4 py-3 text-slate-800">
                          {it.target_price ? `₹${Number(it.target_price).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{it.required_by || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-100 bg-slate-50/50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total target value</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-900">
                        ₹{items.reduce((s, it) => s + (parseFloat(it.target_price || "0") * parseFloat(it.quantity || "0")), 0).toLocaleString("en-IN")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PARTICIPANTS ── */}
        {tab === "participants" && (
          <div>
            {participants.length === 0 ? (
              <p className="text-[13px] text-slate-400">No participants invited.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["Supplier", "Country", "Invited status", "Response"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {participants.map(p => {
                      const resp = responses.find(r => r.supplier === p.name);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-[13px] font-medium text-slate-800">{p.name}</td>
                          <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{p.country}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                              INVITED
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {resp ? (
                              <span className={cn(
                                "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                                resp.status === "SUBMITTED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                              )}>
                                {resp.status}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-300">No response yet</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <div>
            {documents.length === 0 ? (
              <p className="text-[13px] text-slate-400">No documents attached to this event.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["Name", "Type", "Description", "Supplier view", "File"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {documents.map((doc, i) => (
                      <tr key={doc.id} className={cn("hover:bg-slate-50/50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                        <td className="px-4 py-3 font-medium text-slate-800">{doc.name}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
                            doc.docType === "NDA" && "bg-amber-50 text-amber-700 border border-amber-200",
                            doc.docType === "TERMS_CONDITIONS" && "bg-blue-50 text-blue-700 border border-blue-200",
                            doc.docType === "OTHER" && "bg-slate-100 text-slate-600 border border-slate-200",
                          )}>
                            {DOC_TYPE_LABELS[doc.docType]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-[260px] truncate">{doc.description || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3">
                          {doc.visibleToSupplier ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600"><Eye size={12} /> Yes</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400"><EyeOff size={12} /> No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]">
                            <Download size={12} /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {extOpen && (
      <DeadlineExtensionModal
        participants={participants}
        currentDeadline={event.deadline}
        onClose={() => setExtOpen(false)}
        onApply={(newDeadline, scope) => {
          if (scope === "all") setExtendedDeadline(newDeadline);
        }}
      />
    )}
    </>
  );
}
