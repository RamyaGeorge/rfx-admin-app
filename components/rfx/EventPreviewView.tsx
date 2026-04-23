"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import {
  ChevronLeft, FileText, List, Users, HelpCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveEvent, SupplierResponse, WizSection, WizItem, WizParticipant } from "@/lib/rfx-types";

interface EventPreviewViewProps {
  event: ActiveEvent;
  responses: SupplierResponse[];
  sections: WizSection[];
  items: WizItem[];
  participants: WizParticipant[];
  onBack: () => void;
  onViewResponses: () => void;
}

type Tab = "overview" | "questionnaire" | "boq" | "participants";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview",      label: "Overview",      icon: <FileText size={13} /> },
  { key: "questionnaire", label: "Questionnaire",  icon: <HelpCircle size={13} /> },
  { key: "boq",           label: "Line Items",     icon: <List size={13} /> },
  { key: "participants",  label: "Participants",   icon: <Users size={13} /> },
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

export function EventPreviewView({ event, responses, sections, items, participants, onBack, onViewResponses }: EventPreviewViewProps) {
  const [tab, setTab] = useState<Tab>("overview");

  const totalQ = sections.reduce((n, s) => n + s.questions.length, 0);

  return (
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
              <p className="text-[11px] text-slate-400 mt-0.5">{event.number} · Deadline: {event.deadline}</p>
            </div>
          </div>
          <Button onClick={onViewResponses} className="gap-1.5 flex-shrink-0">
            View responses <ArrowRight size={13} />
          </Button>
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
                  <InfoRow label="Submission deadline" value={event.deadline} />
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
                  <InfoRow label="Submission deadline" value={event.deadline} />
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
      </div>
    </div>
  );
}
