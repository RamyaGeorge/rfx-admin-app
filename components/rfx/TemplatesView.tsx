"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypeBadge } from "./shared";
import type { EventType, RFXEvent, WizSection, WizItem } from "@/lib/rfx-types";
import { TEMPLATE_WIZ_DATA } from "@/lib/rfx-data";
import {
  Search, Plus, Copy, Pencil, Trash2, Clock, FileText, Star, StarOff,
  X, LayoutTemplate, ChevronDown, ChevronRight, CheckSquare, Square,
  List, HelpCircle, ArrowLeft,
} from "lucide-react";

export interface Template {
  id: number;
  name: string;
  type: EventType;
  category: string;
  description: string;
  sections: number;
  questions: number;
  items: number;
  lastUsed: string;
  usageCount: number;
  starred: boolean;
  createdBy: string;
  wizSections?: WizSection[];
  wizItems?: WizItem[];
}

export const SEED_TEMPLATES: Template[] = [
  { id: 1,  name: "Annual Lighting Contract",     type: "RFQ", category: "Electrical & Instrumentation", description: "BOQ-based quotation for decorative & industrial lighting procurement.",                       sections: 4, questions: 18, items: 12, lastUsed: "2 days ago",   usageCount: 8, starred: true,  createdBy: "Priya Sharma" },
  { id: 2,  name: "IT Hardware Refresh",          type: "RFQ", category: "IT & Software",                description: "Standard quotation template for annual IT hardware, peripherals and accessories refresh.",    sections: 3, questions: 10, items: 24, lastUsed: "1 week ago",   usageCount: 5, starred: true,  createdBy: "Ravi Kumar" },
  { id: 3,  name: "Office Furniture Procurement", type: "RFP", category: "Facility Management",          description: "Proposal request for office furniture covering design, supply and installation.",             sections: 3, questions: 12, items: 8,  lastUsed: "3 weeks ago",  usageCount: 3, starred: false, createdBy: "Priya Sharma" },
  { id: 4,  name: "EV Charging Survey",           type: "RFI", category: "Construction & Civil",         description: "Market research questionnaire for EV charging infrastructure vendors and technology.",         sections: 2, questions: 15, items: 0,  lastUsed: "1 month ago",  usageCount: 2, starred: false, createdBy: "Anita Rao" },
  { id: 5,  name: "Security Systems RFQ",         type: "RFQ", category: "Facility Management",          description: "BOQ-based quotation for campus security infrastructure including CCTV and access control.",  sections: 5, questions: 22, items: 16, lastUsed: "2 months ago", usageCount: 4, starred: true,  createdBy: "Priya Sharma" },
  { id: 6,  name: "Civil Works BOQ",              type: "RFQ", category: "Construction & Civil",         description: "Standard BOQ quotation for civil construction and renovation works.",                        sections: 4, questions: 14, items: 30, lastUsed: "3 months ago", usageCount: 7, starred: false, createdBy: "Ravi Kumar" },
  { id: 7,  name: "Cloud Services RFP",           type: "RFP", category: "IT & Software",                description: "Request for proposals covering cloud hosting, storage, and managed service providers.",      sections: 4, questions: 20, items: 6,  lastUsed: "1 week ago",   usageCount: 3, starred: false, createdBy: "Anita Rao" },
  { id: 8,  name: "Catering Services RFQ",        type: "RFQ", category: "Facility Management",          description: "Quotation template for corporate cafeteria and event catering services.",                    sections: 2, questions: 8,  items: 15, lastUsed: "5 days ago",   usageCount: 6, starred: false, createdBy: "Priya Sharma" },
  { id: 9,  name: "Vendor Capability Survey",     type: "RFI", category: "HR & Staffing",                description: "Generic market intelligence form to assess new vendor capabilities and certifications.",      sections: 3, questions: 18, items: 0,  lastUsed: "2 weeks ago",  usageCount: 9, starred: true,  createdBy: "Ravi Kumar" },
  { id: 10, name: "Annual Maintenance Contract",  type: "RFQ", category: "Facility Management",          description: "Multi-year AMC quotation for electrical, mechanical, and civil maintenance works.",          sections: 5, questions: 25, items: 20, lastUsed: "4 months ago", usageCount: 5, starred: false, createdBy: "Anita Rao" },
  { id: 11, name: "Printing & Stationery RFQ",    type: "RFQ", category: "Marketing & Communications",   description: "Annual quotation for printing, stationery, and office consumables.",                         sections: 2, questions: 7,  items: 22, lastUsed: "3 weeks ago",  usageCount: 4, starred: false, createdBy: "Priya Sharma" },
  { id: 12, name: "Marketing Agency RFP",         type: "RFP", category: "Marketing & Communications",   description: "Full-service agency proposal covering digital, print, and event marketing.",                 sections: 4, questions: 16, items: 5,  lastUsed: "6 weeks ago",  usageCount: 2, starred: false, createdBy: "Ravi Kumar" },
];

const TYPE_FILTER_TABS: Array<"ALL" | EventType> = ["ALL", "RFI", "RFP", "RFQ"];
const CATEGORIES = ["All", "Electrical", "Technology", "Furniture", "Infrastructure", "Security", "Civil", "Facilities", "General", "Office", "Marketing"];

const TYPE_BG: Record<EventType, string> = {
  RFI: "from-indigo-50 to-white border-indigo-100",
  RFP: "from-sky-50 to-white border-sky-100",
  RFQ: "from-amber-50 to-white border-amber-100",
};

const TYPE_PILL_CLASS: Record<EventType, string> = {
  RFI: "bg-indigo-100 text-indigo-700",
  RFP: "bg-sky-100 text-sky-700",
  RFQ: "bg-amber-100 text-amber-700",
};

const QTYPE_LABEL: Record<string, string> = {
  TEXT: "Text", NUMERIC: "Number", BOOLEAN: "Yes/No",
  SINGLE_CHOICE: "Single choice", MULTI_CHOICE: "Multi choice", FILE_UPLOAD: "File upload",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TemplateDetailModal — shown when clicking Edit on a template card         */
/* ─────────────────────────────────────────────────────────────────────────── */
function TemplateDetailModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const wizData = TEMPLATE_WIZ_DATA.find(w => w.id === template.id);
  const sections = template.wizSections ?? wizData?.sections ?? [];

  function toggleSection(id: number) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalQuestions = sections.reduce((a, s) => a + s.questions.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl w-[700px] h-[82vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
            <LayoutTemplate size={16} className="text-sky-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", TYPE_PILL_CLASS[template.type])}>{template.type}</span>
              <h2 className="text-[15px] font-bold text-slate-900">{template.name}</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{template.category} · By {template.createdBy}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">
          {/* Summary chips */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-[12px] bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">{sections.length} sections</span>
            <span className="text-[12px] bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">{totalQuestions} questions</span>
            <span className="text-[12px] bg-slate-50 border border-slate-200 text-slate-400 px-3 py-1 rounded-full">Last used {template.lastUsed}</span>
          </div>

          {/* Questionnaire — same style as CreateTemplateModal Step 2 */}
          {sections.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <HelpCircle size={13} className="text-sky-500" />
                <span className="text-[13px] font-semibold text-slate-800">Questionnaire</span>
                <span className="text-[11px] text-slate-400 ml-auto">{totalQuestions} questions</span>
              </div>
              <div className="space-y-2">
                {sections.map(sec => {
                  const expanded = expandedSections.has(sec.id);
                  return (
                    <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center bg-slate-50 px-3 py-2.5 gap-2">
                        <CheckSquare size={15} className="text-sky-600 flex-shrink-0" />
                        <button onClick={() => toggleSection(sec.id)} className="flex-1 flex items-center gap-2 text-left">
                          <span className="text-[13px] font-semibold text-slate-800">{sec.title}</span>
                          <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">{sec.type}</span>
                          {sec.mandatory && <span className="text-[10px] text-red-400 font-medium">Required</span>}
                          <span className="ml-auto text-[11px] text-slate-400">{sec.questions.length} q</span>
                          <ChevronRight size={13} className={cn("text-slate-400 transition-transform flex-shrink-0", expanded && "rotate-90")} />
                        </button>
                      </div>
                      {expanded && (
                        <div className="divide-y divide-slate-100">
                          {sec.questions.map((q, qi) => (
                            <div key={q.id} className="flex items-start gap-3 px-4 py-2.5 bg-sky-50/50">
                              <CheckSquare size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[11px] text-slate-300 font-mono mt-0.5 w-4 flex-shrink-0">{qi + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-slate-700">{q.text}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-sky-500">{QTYPE_LABEL[q.qtype] ?? q.qtype}</span>
                                  {q.mandatory && <span className="text-[10px] text-red-400">Required</span>}
                                  {q.scored && <span className="text-[10px] text-emerald-600">Scored {q.weight}%</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-[13px]">
              No questionnaire defined for this template.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CreateTemplateModal — Step 1: name + event  │  Step 2: pick Q&A + items  */
/* ─────────────────────────────────────────────────────────────────────────── */
function CreateTemplateModal({ onClose, onSave, events }: {
  onClose: () => void;
  onSave: (name: string, type: EventType, sections: WizSection[], items: WizItem[]) => void;
  events: RFXEvent[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [nameError, setNameError] = useState("");
  const [eventError, setEventError] = useState("");

  /* Step 2 selection state */
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const selectedEvent = events.find(e => e.id === Number(selectedEventId));

  /* Pull sections from TEMPLATE_WIZ_DATA by event type match */
  const wizData = TEMPLATE_WIZ_DATA.find(w => w.type === selectedEvent?.type);
  const availableSections: WizSection[] = wizData?.sections ?? [];

  /* ── Step 1 → Step 2 ── */
  function goToStep2() {
    let valid = true;
    if (!name.trim()) { setNameError("Template name is required."); valid = false; }
    if (!selectedEventId) { setEventError("Please select an event."); valid = false; }
    if (!valid) return;
    /* Pre-select all questions */
    const allQIds = new Set(availableSections.flatMap(s => s.questions.map(q => q.id)));
    setSelectedQuestionIds(allQIds);
    setExpandedSections(new Set(availableSections.map(s => s.id)));
    setStep(2);
  }

  function toggleSection(id: number) {
    setExpandedSections(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleQuestion(qId: number) {
    setSelectedQuestionIds(prev => { const n = new Set(prev); n.has(qId) ? n.delete(qId) : n.add(qId); return n; });
  }

  function toggleAllQuestionsInSection(sec: WizSection) {
    const allIn = sec.questions.every(q => selectedQuestionIds.has(q.id));
    setSelectedQuestionIds(prev => {
      const n = new Set(prev);
      sec.questions.forEach(q => allIn ? n.delete(q.id) : n.add(q.id));
      return n;
    });
  }

  function handleSave() {
    const finalSections: WizSection[] = availableSections
      .map(s => ({ ...s, questions: s.questions.filter(q => selectedQuestionIds.has(q.id)) }))
      .filter(s => s.questions.length > 0);
    onSave(name.trim(), selectedEvent!.type, finalSections, []);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className={cn(
        "bg-white rounded-2xl shadow-xl flex flex-col relative transition-all duration-200",
        step === 1 ? "w-[460px]" : "w-[700px] h-[82vh]"
      )}>
        {/* Modal header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
            <LayoutTemplate size={16} className="text-sky-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-bold text-slate-900">
              {step === 1 ? "Create template" : name}
            </h2>
            <p className="text-[11px] text-slate-400">
              {step === 1 ? "Step 1 of 2 — Name & source event" : "Step 2 of 2 — Select questionnaire"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="px-6 py-5">
            {/* Template name */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Template name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Annual Stationery Procurement"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(""); }}
                className="text-[13px]"
                autoFocus
              />
              {nameError && <p className="text-[11px] text-red-500 mt-1">{nameError}</p>}
            </div>

            {/* Event dropdown */}
            <div className="mb-6">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Based on event <span className="text-red-400">*</span>
              </label>
              <SearchableEventSelect
                events={events}
                value={selectedEventId}
                onChange={id => { setSelectedEventId(id); setEventError(""); }}
                hasError={!!eventError}
              />
              {eventError && <p className="text-[11px] text-red-500 mt-1">{eventError}</p>}

              {selectedEvent && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", TYPE_PILL_CLASS[selectedEvent.type])}>
                    {selectedEvent.type}
                  </span>
                  <span className="text-[12px] text-slate-600 truncate flex-1">{selectedEvent.number}</span>
                  <span className="text-[11px] text-slate-400">{selectedEvent.status.replace(/_/g, " ")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              <button
                onClick={goToStep2}
                className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">

              {/* Questionnaire sections */}
              {availableSections.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <HelpCircle size={13} className="text-sky-500" />
                    <span className="text-[13px] font-semibold text-slate-800">Questionnaire</span>
                    <span className="text-[11px] text-slate-400 ml-auto">
                      {selectedQuestionIds.size} / {availableSections.reduce((a, s) => a + s.questions.length, 0)} selected
                    </span>
                  </div>
                  <div className="space-y-2">
                    {availableSections.map(sec => {
                      const expanded = expandedSections.has(sec.id);
                      const allIn = sec.questions.every(q => selectedQuestionIds.has(q.id));
                      const someIn = sec.questions.some(q => selectedQuestionIds.has(q.id));
                      return (
                        <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="flex items-center bg-slate-50 px-3 py-2.5 gap-2">
                            {/* section toggle checkbox */}
                            <button onClick={() => toggleAllQuestionsInSection(sec)} className="flex-shrink-0 text-slate-400 hover:text-sky-600 transition-colors">
                              {allIn ? <CheckSquare size={15} className="text-sky-600" /> : someIn ? <CheckSquare size={15} className="text-sky-300" /> : <Square size={15} />}
                            </button>
                            <button onClick={() => toggleSection(sec.id)} className="flex-1 flex items-center gap-2 text-left">
                              <span className="text-[13px] font-semibold text-slate-800">{sec.title}</span>
                              <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">{sec.type}</span>
                              {sec.mandatory && <span className="text-[10px] text-red-400 font-medium">Required</span>}
                              <span className="ml-auto text-[11px] text-slate-400">{sec.questions.length} q</span>
                              <ChevronRight size={13} className={cn("text-slate-400 transition-transform flex-shrink-0", expanded && "rotate-90")} />
                            </button>
                          </div>
                          {expanded && (
                            <div className="divide-y divide-slate-100">
                              {sec.questions.map((q, qi) => {
                                const checked = selectedQuestionIds.has(q.id);
                                return (
                                  <button
                                    key={q.id}
                                    onClick={() => toggleQuestion(q.id)}
                                    className={cn(
                                      "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                                      checked ? "bg-sky-50/50" : "hover:bg-slate-50"
                                    )}
                                  >
                                    <div className="mt-0.5 flex-shrink-0">
                                      {checked ? <CheckSquare size={14} className="text-sky-600" /> : <Square size={14} className="text-slate-300" />}
                                    </div>
                                    <span className="text-[11px] text-slate-300 font-mono mt-0.5 w-4 flex-shrink-0">{qi + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-[13px]", checked ? "text-slate-700" : "text-slate-400")}>{q.text}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-sky-500">{QTYPE_LABEL[q.qtype] ?? q.qtype}</span>
                                        {q.mandatory && <span className="text-[10px] text-red-400">Required</span>}
                                        {q.scored && <span className="text-[10px] text-emerald-600">Scored {q.weight}%</span>}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableSections.length === 0 && (
                <div className="py-16 text-center text-slate-400 text-[13px]">
                  No questionnaire found for this event type.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-[12px] text-slate-400">
                {selectedQuestionIds.size} questions selected
              </span>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 text-[13px] font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                  Save template
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Searchable event selector ──────────────────────────────────────────── */
function SearchableEventSelect({ events, value, onChange, hasError }: {
  events: RFXEvent[];
  value: number | "";
  onChange: (id: number | "") => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = events.find(e => e.id === value);
  const filtered = events.filter(e =>
    `${e.type} ${e.title} ${e.number}`.toLowerCase().includes(query.toLowerCase())
  );

  function select(ev: RFXEvent) {
    onChange(ev.id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center w-full h-9 px-3 border rounded-lg text-[13px] bg-white cursor-pointer transition-all",
          hasError ? "border-red-300" : open ? "border-primary ring-1 ring-primary/20" : "border-slate-200 hover:border-slate-300"
        )}
      >
        {open ? (
          <input
            autoFocus
            value={query}
            onChange={e => { e.stopPropagation(); setQuery(e.target.value); }}
            onClick={e => e.stopPropagation()}
            placeholder="Search events…"
            className="flex-1 outline-none text-[13px] text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        ) : (
          <span className={cn("flex-1 truncate", selected ? "text-slate-800" : "text-slate-400")}>
            {selected ? `[${selected.type}] ${selected.title} — ${selected.number}` : "Select an event…"}
          </span>
        )}
        <ChevronDown size={13} className={cn("ml-2 flex-shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-slate-400">No events found.</p>
          ) : (
            filtered.map(ev => (
              <button
                key={ev.id}
                onMouseDown={e => { e.preventDefault(); select(ev); }}
                className={cn(
                  "w-full text-left px-3 py-2 text-[13px] transition-colors",
                  ev.id === value ? "bg-primary/5 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="font-medium text-slate-500 mr-1">[{ev.type}]</span>
                {ev.title}
                <span className="text-slate-400 text-[12px] ml-1">— {ev.number}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main TemplatesView                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
export function TemplatesView({ onUseTemplate, starredIds, onToggleStar, onCreateTemplate, events }: {
  onUseTemplate: (id: number) => void;
  starredIds: Set<number>;
  onToggleStar: (id: number) => void;
  onCreateTemplate?: (template: Template) => void;
  events: RFXEvent[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | EventType>("ALL");
  const [category, setCategory] = useState("All");
  const [localTemplates, setLocalTemplates] = useState<Template[]>(SEED_TEMPLATES);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  function handleDeleteTemplate(id: number) {
    setLocalTemplates(prev => prev.filter(t => t.id !== id));
  }

  function handleSaveTemplate(name: string, type: EventType, sections: WizSection[], items: WizItem[]) {
    const newTpl: Template = {
      id: Date.now(),
      name,
      type,
      category: "General",
      description: `Custom template created by Priya Sharma.`,
      sections: sections.length,
      questions: sections.reduce((a, s) => a + s.questions.length, 0),
      items: items.length,
      lastUsed: "just now",
      usageCount: 0,
      starred: false,
      createdBy: "Priya Sharma",
      wizSections: sections,
      wizItems: items,
    };
    setLocalTemplates(prev => [newTpl, ...prev]);
    onCreateTemplate?.(newTpl);
    setCreateOpen(false);
  }

  const filtered = localTemplates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "ALL" || t.type === typeFilter;
    const matchCat    = category === "All" || t.category === category;
    return matchSearch && matchType && matchCat;
  });

  const starred   = filtered.filter(t => starredIds.has(t.id));
  const unstarred = filtered.filter(t => !starredIds.has(t.id));

  const counts: Record<"ALL" | EventType, number> = {
    ALL: localTemplates.length,
    RFI: localTemplates.filter(t => t.type === "RFI").length,
    RFP: localTemplates.filter(t => t.type === "RFP").length,
    RFQ: localTemplates.filter(t => t.type === "RFQ").length,
  };

  return (
    <div className="p-7">
      {createOpen && (
        <CreateTemplateModal
          onClose={() => setCreateOpen(false)}
          onSave={handleSaveTemplate}
          events={events}
        />
      )}
      {editingTemplate && (
        <TemplateDetailModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900">Templates</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">{localTemplates.length} reusable event templates · Speed up your procurement workflow</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus size={13} /> Create template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative min-w-[240px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-[13px] h-9" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-white text-slate-700">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-0 border-b border-slate-200 ml-auto">
          {TYPE_FILTER_TABS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3.5 py-2 text-[13px] border-b-2 mb-[-1px] transition-all",
                typeFilter === t ? "text-sky-600 border-sky-500 font-medium" : "text-slate-500 border-transparent hover:text-slate-800"
              )}>
              {t}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-[13px]">No templates match your search.</div>
      )}

      {starred.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-[13px] font-semibold text-slate-700">Starred</span>
            <span className="text-[11px] text-slate-400">({starred.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {starred.map(t => (
              <TemplateCard key={t.id} template={t} isStarred={starredIds.has(t.id)}
                onUse={onUseTemplate} onToggleStar={onToggleStar} onEdit={setEditingTemplate} onDelete={handleDeleteTemplate} />
            ))}
          </div>
        </div>
      )}

      {unstarred.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={13} className="text-slate-400" />
            <span className="text-[13px] font-semibold text-slate-700">{starred.length > 0 ? "All other templates" : "All templates"}</span>
            <span className="text-[11px] text-slate-400">({unstarred.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {unstarred.map(t => (
              <TemplateCard key={t.id} template={t} isStarred={starredIds.has(t.id)}
                onUse={onUseTemplate} onToggleStar={onToggleStar} onEdit={setEditingTemplate} onDelete={handleDeleteTemplate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template: t, isStarred, onUse, onToggleStar, onEdit, onDelete }: {
  template: Template;
  isStarred: boolean;
  onUse: (id: number) => void;
  onToggleStar: (id: number) => void;
  onEdit: (t: Template) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className={cn("bg-gradient-to-b border rounded-xl p-4 hover:shadow-md transition-all group relative", TYPE_BG[t.type])}>
      <button onClick={() => onToggleStar(t.id)}
        className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-amber-400">
        {isStarred ? <Star size={14} className="text-amber-400 fill-amber-400" /> : <StarOff size={14} />}
      </button>

      <div className="flex items-start gap-2.5 mb-2.5">
        <TypeBadge type={t.type} />
        <span className="text-[11px] text-slate-400 mt-0.5">{t.category}</span>
      </div>

      <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5 pr-6">{t.name}</h3>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-3.5 line-clamp-2">{t.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.sections} sections</span>
        <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.questions} questions</span>
        {t.items > 0 && <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.items} line items</span>}
      </div>

      <div className="flex items-center justify-between border-t border-white/60 pt-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={10} /> Last used {t.lastUsed}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Used {t.usageCount}× · {t.createdBy}</div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(t)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(t.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <Trash2 size={12} />
          </button>
          <Button size="sm" onClick={() => onUse(t.id)} className="h-7 text-[11px] gap-1 px-2.5">
            <Copy size={11} /> Use
          </Button>
        </div>
      </div>
    </div>
  );
}
