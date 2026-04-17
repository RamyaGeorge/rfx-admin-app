"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InfoBox, SectionLabel, ToggleRow, NotApplicable, TypeBadge } from "./shared";
import { TYPE_COLORS } from "./shared";
import { SUPPLIER_CATALOGUE, TYPE_CONFIG, DEFAULT_WIZ_STATE } from "@/lib/rfx-data";
import type { WizState, WizItem, WizSection, WizQuestion, EventType, AppView } from "@/lib/rfx-types";
import {
  Check, ChevronLeft, ChevronRight, Plus, Trash2, Search,
  FileText, GripVertical, X, CheckCircle2,
} from "lucide-react";

interface WizardProps {
  onNavigate: (view: AppView) => void;
  onPublish: (wiz: WizState) => void;
}

const QTYPES = ["TEXT", "NUMERIC", "BOOLEAN", "SINGLE_CHOICE", "MULTI_CHOICE", "FILE_UPLOAD", "DATE"];
const QTYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  NUMERIC: "Numeric",
  BOOLEAN: "Boolean",
  SINGLE_CHOICE: "Single Choice",
  MULTI_CHOICE: "Multi Choice",
  FILE_UPLOAD: "File Upload",
  DATE: "Date",
};
const SEC_TYPES = ["GENERAL", "TECHNICAL", "COMPLIANCE", "HSE", "FINANCIAL"];

const TOGGLE_DEFS: Record<string, { label: string; sub: string }> = {
  nda_required:               { label: "NDA required",              sub: "Suppliers must sign NDA before accessing event documents." },
  intent_to_participate_req:  { label: "Intent to participate",     sub: "Suppliers must confirm participation before they can submit." },
  allow_supplier_attachments: { label: "Allow supplier attachments",sub: "Suppliers can upload supporting documents with their response." },
  two_envelope_system:        { label: "Two-envelope system",       sub: "Technical and financial bids evaluated separately." },
  bid_bond_required:          { label: "Bid bond required",         sub: "Suppliers must submit a bid security / earnest money deposit." },
  site_visit_required:        { label: "Site visit required",       sub: "Mandatory site inspection before submission." },
  price_negotiation_enabled:  { label: "Enable price negotiation",  sub: "Buyers can negotiate pricing post-evaluation." },
};

export function Wizard({ onNavigate, onPublish }: WizardProps) {
  const [wiz, setWiz] = useState<WizState>({ ...DEFAULT_WIZ_STATE });

  const cfg = TYPE_CONFIG[wiz.type];
  const steps = cfg.steps;
  const pct = Math.round(((wiz.step + 1) / steps.length) * 100);

  const STEP_MAP: Record<string, () => React.ReactNode> = {
    "Event type":      () => <Step0 wiz={wiz} setWiz={setWiz} />,
    "Basic details":   () => <Step1 wiz={wiz} setWiz={setWiz} />,
    "Deliverables":    () => <Step2 wiz={wiz} setWiz={setWiz} />,
    "Line items (BOQ)":() => <Step2 wiz={wiz} setWiz={setWiz} />,
    "BOQ / Schedule":  () => <Step2 wiz={wiz} setWiz={setWiz} />,
    "Documents":       () => <Step3 wiz={wiz} />,
    "Questionnaire":   () => <Step4 wiz={wiz} setWiz={setWiz} />,
    "Participants":    () => <Step5 wiz={wiz} setWiz={setWiz} />,
    "Reminders":       () => <Step6 wiz={wiz} setWiz={setWiz} />,
    "Review":          () => <Step7 wiz={wiz} />,
  };

  const currentPanel = STEP_MAP[steps[wiz.step]]?.() ?? null;
  const isLast = wiz.step === steps.length - 1;

  function handleNext() {
    if (isLast) { onPublish(wiz); } else { setWiz(w => ({ ...w, step: w.step + 1 })); }
  }
  function handlePrev() {
    if (wiz.step === 0) { onNavigate("events"); } else { setWiz(w => ({ ...w, step: w.step - 1 })); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* progress bar */}
      <div className="h-[3px] bg-slate-100">
        <div className="h-full bg-sky-500 rounded-r-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-1 gap-6 p-7 overflow-hidden">
        {/* Sidebar steps */}
        <div className="w-[220px] flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sticky top-0">
            {steps.map((s, i) => {
              const done = i < wiz.step;
              const active = i === wiz.step;
              return (
                <button
                  key={s}
                  onClick={() => setWiz(w => ({ ...w, step: i }))}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-2.5 rounded-lg mb-0.5 text-left transition-all",
                    active && "bg-sky-50",
                    !active && !done && "hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-[26px] h-[26px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    active && "bg-sky-500 border-sky-500",
                    done && "bg-emerald-50 border-emerald-300",
                    !active && !done && "bg-slate-50 border-slate-200"
                  )}>
                    {done
                      ? <Check size={11} className="text-emerald-600 stroke-[2.5]" />
                      : <span className={cn("text-[11px] font-semibold", active ? "text-white" : "text-slate-400")}>{i + 1}</span>
                    }
                  </div>
                  <div>
                    <div className={cn("text-[13px] font-medium",
                      active ? "text-sky-700" : done ? "text-slate-800" : "text-slate-400"
                    )}>{s}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{cfg.stepSubs[i]}</div>
                    {i > 0 && i < steps.length - 1 && (
                      <span className={cn(
                        "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1",
                        TYPE_COLORS[wiz.type].bg, TYPE_COLORS[wiz.type].color
                      )}>{wiz.type}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel */}
        <div className="flex-1 overflow-y-auto pb-20">
          {currentPanel}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-7 py-3.5 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <span className="text-[12px] text-slate-400">Step {wiz.step + 1} of {steps.length}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrev} className="gap-1">
            <ChevronLeft size={14} /> {wiz.step === 0 ? "Cancel" : "Previous"}
          </Button>
          <Button size="sm" onClick={handleNext} className="gap-1">
            {isLast ? "Publish event" : "Next step"} {!isLast && <ChevronRight size={14} />}
            {isLast && <Check size={13} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 0: Event type ─────────────────────────────────────────── */
function Step0({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const types: { t: EventType; name: string; desc: string; features: string[] }[] = [
    { t: "RFI", name: "Request for Information", desc: "Gather market intelligence, assess supplier capability – no pricing.", features: ["No BOQ or financial data", "Questionnaire-based response", "Soft deadline, open-ended"] },
    { t: "RFP", name: "Request for Proposal",    desc: "Detailed proposals with pricing, methodology & team qualifications.", features: ["Optional deliverables / scope", "Weighted tech + commercial score", "Negotiation allowed"] },
    { t: "RFQ", name: "Request for Quotation",   desc: "Structured BOQ – suppliers quote unit prices, award on L1 basis.", features: ["BOQ mandatory", "Bid bond optional", "L1 (lowest price) award"] },
    { t: "RFT", name: "Request for Tender",      desc: "Formal two-envelope public tender – technical gate before financial.", features: ["Two-envelope system", "Bid bond required", "NDA & site visit support"] },
  ];

  return (
    <FormCard title="Select event type" sub="The event type determines which features are available throughout the wizard.">
      <div className="grid grid-cols-2 gap-3">
        {types.map(({ t, name, desc, features }) => {
          const sel = wiz.type === t;
          const c = TYPE_COLORS[t];
          return (
            <button
              key={t}
              onClick={() => setWiz(w => ({ ...w, type: t, step: 0 }))}
              className={cn(
                "text-left border-[1.5px] rounded-xl p-4 cursor-pointer transition-all relative bg-white hover:border-sky-400",
                sel ? `${c.bg} border-current` : "border-slate-200"
              )}
              style={sel ? { borderColor: t === "RFI" ? "#6366f1" : t === "RFP" ? "#0ea5e9" : t === "RFQ" ? "#f59e0b" : "#0d9488" } : {}}
            >
              {/* check circle */}
              <div className={cn(
                "absolute top-3.5 right-3.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all",
                sel ? "bg-sky-500 border-sky-500" : "bg-white border-slate-200"
              )}>
                {sel && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <TypeBadge type={t} />
              <div className="text-[14px] font-semibold text-slate-900 mt-2 mb-1.5">{name}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed mb-2.5">{desc}</div>
              <div className="flex flex-col gap-1">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Check size={11} className="text-slate-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </FormCard>
  );
}

/* ── Step 1: Basic details ──────────────────────────────────────── */
function Step1({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const cfg = TYPE_CONFIG[wiz.type];
  const c = TYPE_COLORS[wiz.type];

  return (
    <FormCard title="Basic details" sub="Core event information visible to all invited suppliers.">
      {/* type label bar */}
      <div className={cn("flex items-center gap-2.5 px-3.5 py-2.5 rounded-md mb-5 text-[13px] font-medium border", c.bg, c.color)}
        style={{ borderColor: "currentColor", opacity: 1 }}>
        <TypeBadge type={wiz.type} /> {cfg.name}
        <span className="text-[12px] font-normal opacity-70 ml-1">— {cfg.tagline}</span>
      </div>

      <SectionLabel>Event identity</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FieldWrap label="Event title" required>
          <Input defaultValue="Annual Decorative Lighting Contract" />
        </FieldWrap>
        <FieldWrap label="Reference number">
          <Input readOnly value={`${wiz.type}-2025-0019`} className="bg-slate-50 text-slate-500" />
        </FieldWrap>
      </div>
      <FieldWrap label="Description / scope summary" className="mb-3.5">
        <Textarea defaultValue="Supply and installation of decorative lighting for Phase 2 of the HQ renovation project." className="min-h-[70px]" />
      </FieldWrap>

      <SectionLabel>Timeline</SectionLabel>
      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        <FieldWrap label="Submission deadline" required>
          <Input type="date" defaultValue="2025-09-30" />
        </FieldWrap>
        <FieldWrap label="Clarification deadline">
          <Input type="date" defaultValue="2025-09-15" />
        </FieldWrap>
        {cfg.showSiteVisit ? (
          <FieldWrap label="Site visit date">
            <Input type="date" defaultValue="2025-08-20" />
          </FieldWrap>
        ) : <div />}
      </div>

      {cfg.showPricing && (
        <>
          <SectionLabel>Budget</SectionLabel>
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <FieldWrap label="Estimated contract value (₹)">
              <Input defaultValue="50,00,000" />
              <p className="text-[11px] text-slate-400 mt-1">Internal reference only – not shown to suppliers unless disclosed.</p>
            </FieldWrap>
            <FieldWrap label="Currency">
              <select className="w-full px-2.5 py-2 border border-slate-200 rounded-md text-[13px] text-slate-800 bg-white focus:outline-none focus:border-sky-400">
                <option>INR – Indian Rupee</option>
                <option>USD – US Dollar</option>
                <option>EUR – Euro</option>
              </select>
            </FieldWrap>
          </div>
        </>
      )}

      <SectionLabel>Settings</SectionLabel>
      <div className="rounded-lg border border-slate-100 px-1 divide-y divide-slate-100">
        {cfg.togglesToShow.map(k => {
          const def = TOGGLE_DEFS[k];
          const on = wiz.toggles[k as keyof typeof wiz.toggles];
          return (
            <div key={k}>
              <ToggleRow label={def.label} sub={def.sub} checked={on}
                onChange={(v) => setWiz(w => ({ ...w, toggles: { ...w.toggles, [k]: v } }))} />
              {k === "two_envelope_system" && on && cfg.showTwoEnvelope && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-r-md px-4 py-3.5 mb-2 ml-2">
                  <div className="grid grid-cols-2 gap-3.5">
                    <FieldWrap label="Tech envelope opening date">
                      <Input type="date" defaultValue="2025-10-05" />
                    </FieldWrap>
                    <FieldWrap label="Financial envelope opening date">
                      <Input type="date" defaultValue="2025-10-15" />
                    </FieldWrap>
                  </div>
                </div>
              )}
              {k === "bid_bond_required" && on && cfg.showBidBond && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-md px-4 py-3.5 mb-2 ml-2">
                  <div className="grid grid-cols-3 gap-3.5">
                    <FieldWrap label="Bid bond amount (₹)"><Input defaultValue="1,00,000" /></FieldWrap>
                    <FieldWrap label="Type">
                      <select className="w-full px-2.5 py-2 border border-slate-200 rounded-md text-[13px] bg-white">
                        <option>Bank Guarantee</option><option>DD / Pay Order</option><option>Insurance Bond</option>
                      </select>
                    </FieldWrap>
                    <FieldWrap label="Validity (days)"><Input type="number" defaultValue="90" /></FieldWrap>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {cfg.infoBox && <InfoBox variant="blue" children={cfg.infoBox} />}
    </FormCard>
  );
}

/* ── Step 2: BOQ / Line items ───────────────────────────────────── */
function Step2({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const cfg = TYPE_CONFIG[wiz.type];
  if (!cfg.showItems) {
    return (
      <FormCard title="Line items" sub="">
        <NotApplicable>Line items / BOQ are not applicable for {wiz.type}. This step is skipped.</NotApplicable>
      </FormCard>
    );
  }

  function addItem() {
    setWiz(w => ({
      ...w,
      items: [...w.items, { id: Date.now(), item_code: "", description: "", quantity: "1", unit: "PCS", target_price: "", technical_spec: "", required_by: "" }],
    }));
  }
  function delItem(idx: number) {
    setWiz(w => ({ ...w, items: w.items.filter((_, i) => i !== idx) }));
  }
  function updateItem(idx: number, field: keyof WizItem, val: string) {
    setWiz(w => ({ ...w, items: w.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  }

  return (
    <FormCard title={cfg.itemsLabel ?? "Line items"} sub={cfg.itemsNote ?? ""}>
      {cfg.infoBox && <InfoBox variant="amber">{cfg.infoBox}</InfoBox>}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px]">Item code</th>
              <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px]">Description</th>
              <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px] w-16">Qty</th>
              <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px] w-20">Unit</th>
              {cfg.showPricing && <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px]">Target ₹</th>}
              {cfg.showTechFields && <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px]">Tech spec</th>}
              <th className="text-left px-2.5 py-2 font-semibold text-slate-400 text-[11px]">Required by</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {wiz.items.map((it, i) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="px-1.5 py-1.5"><Input value={it.item_code} onChange={e => updateItem(i, "item_code", e.target.value)} className="h-8 text-[12px]" placeholder="Code" /></td>
                <td className="px-1.5 py-1.5"><Input value={it.description} onChange={e => updateItem(i, "description", e.target.value)} className="h-8 text-[12px]" placeholder="Description" /></td>
                <td className="px-1.5 py-1.5"><Input value={it.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className="h-8 text-[12px] w-16" type="number" /></td>
                <td className="px-1.5 py-1.5">
                  <select value={it.unit} onChange={e => updateItem(i, "unit", e.target.value)} className="h-8 px-2 border border-slate-200 rounded-md text-[12px] bg-white w-full">
                    {["PCS","MT","KG","NOS","LOT"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                {cfg.showPricing && <td className="px-1.5 py-1.5"><Input value={it.target_price} onChange={e => updateItem(i, "target_price", e.target.value)} className="h-8 text-[12px]" placeholder="0.00" /></td>}
                {cfg.showTechFields && <td className="px-1.5 py-1.5"><Input value={it.technical_spec} onChange={e => updateItem(i, "technical_spec", e.target.value)} className="h-8 text-[12px]" placeholder="Spec" /></td>}
                <td className="px-1.5 py-1.5"><Input value={it.required_by} onChange={e => updateItem(i, "required_by", e.target.value)} type="date" className="h-8 text-[12px]" /></td>
                <td className="px-1.5 py-1.5">
                  <button onClick={() => delItem(i)} className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={addItem} className="mt-3 gap-1.5">
        <Plus size={12} /> Add item
      </Button>
    </FormCard>
  );
}

/* ── Step 3: Documents ──────────────────────────────────────────── */
function Step3({ wiz }: { wiz: WizState }) {
  return (
    <FormCard title="Documents" sub="Upload technical specifications, NDA, and terms & conditions for suppliers to review.">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FieldWrap label="Technical specifications">
          <Input type="file" className="cursor-pointer" />
          <p className="text-[11px] text-slate-400 mt-1">Detailed specs, drawings, or standards to be met.</p>
        </FieldWrap>
        <FieldWrap label="Terms & conditions">
          <Input type="file" className="cursor-pointer" />
        </FieldWrap>
      </div>
      {wiz.toggles.nda_required && (
        <FieldWrap label="NDA template" required className="mb-3.5">
          <Input type="file" className="cursor-pointer" />
          <p className="text-[11px] text-slate-400 mt-1">Required – suppliers must acknowledge before accessing event documents.</p>
        </FieldWrap>
      )}
      <FieldWrap label="Additional documents">
        <Input type="file" multiple className="cursor-pointer" />
      </FieldWrap>
    </FormCard>
  );
}

/* ── Step 4: Questionnaire ──────────────────────────────────────── */
function Step4({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  function addSection() {
    setWiz(w => ({
      ...w,
      sections: [...w.sections, { id: Date.now(), title: "New section", type: "GENERAL", mandatory: false, questions: [] }],
    }));
  }
  function delSection(si: number) {
    setWiz(w => ({ ...w, sections: w.sections.filter((_, i) => i !== si) }));
  }
  function updateSec(si: number, field: keyof WizSection, val: unknown) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, [field]: val } : s) }));
  }
  function addQ(si: number) {
    setWiz(w => ({
      ...w,
      sections: w.sections.map((s, i) => i === si
        ? { ...s, questions: [...s.questions, { id: Date.now(), text: "", qtype: "TEXT", mandatory: false, scored: false, weight: 0 }] }
        : s),
    }));
  }
  function delQ(si: number, qi: number) {
    setWiz(w => ({
      ...w,
      sections: w.sections.map((s, i) => i === si ? { ...s, questions: s.questions.filter((_, j) => j !== qi) } : s),
    }));
  }
  function updateQ(si: number, qi: number, field: keyof WizQuestion, val: unknown) {
    setWiz(w => ({
      ...w,
      sections: w.sections.map((s, i) => i === si
        ? { ...s, questions: s.questions.map((q, j) => j === qi ? { ...q, [field]: val } : q) }
        : s),
    }));
  }

  const SEC_TYPE_COLORS: Record<string, string> = {
    TECHNICAL: "bg-sky-50 text-sky-700", GENERAL: "bg-slate-100 text-slate-500",
    HSE: "bg-amber-50 text-amber-700", FINANCIAL: "bg-red-50 text-red-700", COMPLIANCE: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Questionnaire</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Build the supplier questionnaire. Scored questions contribute to the technical evaluation score.</p>
        </div>
        <Button size="sm" onClick={addSection} className="gap-1.5"><Plus size={12} /> Add section</Button>
      </div>

      {wiz.sections.length === 0 && (
        <NotApplicable>No sections yet. Add a section to start building the questionnaire.</NotApplicable>
      )}

      {wiz.sections.map((sec, si) => (
        <div key={sec.id} className="border border-slate-200 rounded-xl mb-3 overflow-hidden">
          {/* section header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 flex-wrap">
            <Input
              defaultValue={sec.title}
              onBlur={e => updateSec(si, "title", e.target.value)}
              className="h-8 text-[13px] font-semibold w-48 flex-shrink-0"
              placeholder="Section title…"
            />
            <select
              value={sec.type}
              onChange={e => updateSec(si, "type", e.target.value)}
              className="h-8 px-2 border border-slate-200 rounded-md text-[11px] bg-white"
            >
              {SEC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
              <Checkbox checked={sec.mandatory} onCheckedChange={v => updateSec(si, "mandatory", !!v)} />
              Required section
            </label>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => addQ(si)} className="gap-1 h-7 text-[12px]">
                <Plus size={11} /> Add question
              </Button>
              <button onClick={() => delSection(si)} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* questions */}
          <div className="px-4 py-3 divide-y divide-slate-100">
            {sec.questions.length === 0 && (
              <p className="text-[12px] text-slate-400 py-2">No questions yet. Click "+ Add question" to add one.</p>
            )}
            {sec.questions.map((q, qi) => (
              <div key={q.id} className="flex flex-wrap items-start gap-2.5 py-2.5">
                <GripVertical size={14} className="text-slate-300 mt-1.5 cursor-grab flex-shrink-0" />
                <Input
                  defaultValue={q.text}
                  onBlur={e => updateQ(si, qi, "text", e.target.value)}
                  className="h-8 text-[12px] flex-1 min-w-40"
                  placeholder="Question text…"
                />
                <select
                  value={q.qtype}
                  onChange={e => updateQ(si, qi, "qtype", e.target.value)}
                  className="h-8 px-2 border border-slate-200 rounded-md text-[11px] bg-white"
                >
                  {QTYPES.map(t => <option key={t} value={t}>{QTYPE_LABELS[t]}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer mt-1.5">
                  <Checkbox checked={q.mandatory} onCheckedChange={v => updateQ(si, qi, "mandatory", !!v)} />
                  Mandatory
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer mt-1.5">
                  <Checkbox checked={q.scored} onCheckedChange={v => updateQ(si, qi, "scored", !!v)} />
                  Scored
                </label>
                {q.scored && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                    Weight:
                    <Input
                      type="number" min="0" max="100"
                      defaultValue={q.weight ?? 0}
                      onBlur={e => updateQ(si, qi, "weight", parseInt(e.target.value) || 0)}
                      className="h-7 w-14 text-[11px] text-center"
                    />
                    %
                  </div>
                )}
                <button onClick={() => delQ(si, qi)} className="w-7 h-7 mt-0.5 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Step 5: Participants ───────────────────────────────────────── */
function Step5({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const already = wiz.participants.map(p => p.name);
  const catalogue = SUPPLIER_CATALOGUE.filter(s => !already.includes(s.name));
  const filtered = wiz._inviteSearch
    ? catalogue.filter(s => s.name.toLowerCase().includes(wiz._inviteSearch!.toLowerCase()) || s.country.toLowerCase().includes(wiz._inviteSearch!.toLowerCase()))
    : catalogue;

  const SP_COLORS: Record<string, string> = {
    INVITED: "bg-indigo-100 text-indigo-700", ACCEPTED: "bg-emerald-100 text-emerald-700",
    SUBMITTED: "bg-emerald-100 text-emerald-700", DECLINED: "bg-red-100 text-red-700",
  };

  const counts = { INVITED: 0, ACCEPTED: 0, SUBMITTED: 0, DECLINED: 0 };
  wiz.participants.forEach(p => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });

  function toggleSelect(name: string) {
    setWiz(w => {
      const sel = w._inviteSelected ?? [];
      return { ...w, _inviteSelected: sel.includes(name) ? sel.filter(n => n !== name) : [...sel, name] };
    });
  }
  function confirmInvite() {
    const sel = wiz._inviteSelected ?? [];
    const newParticipants = SUPPLIER_CATALOGUE.filter(s => sel.includes(s.name)).map((s, i) => ({
      id: Date.now() + i, name: s.name, country: s.country, status: "INVITED" as const,
    }));
    setWiz(w => ({ ...w, participants: [...w.participants, ...newParticipants], _inviteOpen: false, _inviteSearch: "", _inviteSelected: [] }));
  }

  return (
    <FormCard title="Participants" sub="Invite suppliers to this event. They will be notified when the event is published.">
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setWiz(w => ({ ...w, _inviteOpen: true, _inviteSearch: "", _inviteSelected: [] }))} className="gap-1.5">
          <Plus size={12} /> Invite suppliers
        </Button>
      </div>

      {/* Invite panel */}
      {wiz._inviteOpen && (
        <div className="border-[1.5px] border-sky-400 rounded-xl p-5 mb-4 bg-sky-50/30">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Invite suppliers</div>
              <div className="text-[12px] text-slate-500 mt-0.5">Search and select suppliers to invite to this event.</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setWiz(w => ({ ...w, _inviteOpen: false }))} className="gap-1">
              <X size={13} /> Cancel
            </Button>
          </div>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search suppliers by name or country…"
              value={wiz._inviteSearch ?? ""}
              onChange={e => setWiz(w => ({ ...w, _inviteSearch: e.target.value }))}
              className="pl-8 text-[13px]"
            />
          </div>
          {(wiz._inviteSelected?.length ?? 0) > 0 && (
            <p className="text-[11px] text-sky-600 font-medium mb-2.5">{wiz._inviteSelected!.length} supplier(s) selected</p>
          )}
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {filtered.length === 0
              ? <p className="text-center text-[12px] text-slate-400 py-4">No suppliers found.</p>
              : filtered.map(s => {
                  const checked = (wiz._inviteSelected ?? []).includes(s.name);
                  return (
                    <div
                      key={s.name}
                      onClick={() => toggleSelect(s.name)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg cursor-pointer border transition-all",
                        checked ? "bg-sky-50 border-sky-300" : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                        checked ? "bg-sky-500 border-sky-500" : "bg-white border-slate-300"
                      )}>
                        {checked && <Check size={10} className="text-white stroke-[3]" />}
                      </div>
                      <span className="flex-1 text-[13px] font-medium text-slate-800">{s.name}</span>
                      <span className="text-[11px] text-slate-400">{s.country}</span>
                    </div>
                  );
                })
            }
          </div>
          {(wiz._inviteSelected?.length ?? 0) > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-200 flex items-center gap-3">
              <Button size="sm" onClick={confirmInvite} className="gap-1.5">
                Send invitations ({wiz._inviteSelected!.length})
              </Button>
              <span className="text-[12px] text-slate-400">Suppliers will receive an email invitation once the event is published.</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {[
          { v: wiz.participants.length, l: "Total" },
          { v: counts.INVITED, l: "Invited" },
          { v: counts.ACCEPTED, l: "Accepted" },
          { v: counts.SUBMITTED, l: "Submitted" },
        ].map(({ v, l }) => (
          <div key={l} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-[20px] font-bold text-slate-900">{v}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {wiz.participants.length === 0
        ? <NotApplicable>No suppliers invited yet. Click "Invite suppliers" to add participants.</NotApplicable>
        : (
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50">
              <tr>
                {["Supplier", "Country", "Status", ""].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wiz.participants.map((p, pi) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-slate-800">{p.name}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-[11px]">{p.country}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", SP_COLORS[p.status] ?? "bg-slate-100 text-slate-500")}>{p.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="outline" size="sm" className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setWiz(w => ({ ...w, participants: w.participants.filter((_, i) => i !== pi) }))}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </FormCard>
  );
}

/* ── Step 6: Reminders ──────────────────────────────────────────── */
function Step6({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const RECIPIENTS = ["MANAGER", "STAKEHOLDER", "SUPPLIER"];
  function toggleRec(i: number, rc: string) {
    setWiz(w => ({
      ...w,
      reminders: w.reminders.map((r, ri) => ri !== i ? r : {
        ...r,
        recipients: r.recipients.includes(rc) ? r.recipients.filter(x => x !== rc) : [...r.recipients, rc],
      }),
    }));
  }
  function addReminder() {
    setWiz(w => ({
      ...w,
      reminders: [...w.reminders, { id: Date.now(), headline: "New reminder", scheduled: "2025-09-25T09:00", recipients: ["SUPPLIER"], sent: false, excl_sub: true }],
    }));
  }

  return (
    <FormCard title="Reminders & notifications" sub="Reminders respect each user's notification preferences and the org email settings.">
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={addReminder} className="gap-1.5"><Plus size={12} /> Add reminder</Button>
      </div>
      <InfoBox variant="blue">
        Mandatory system notifications (e.g. EVT_CANCELLED, SUP_AWARDED) are always sent regardless of user opt-out preferences. The reminders here are supplemental.
      </InfoBox>
      <div className="space-y-2.5">
        {wiz.reminders.map((r, i) => (
          <div key={r.id} className="border border-slate-200 rounded-xl px-4 py-3.5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{r.headline}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.scheduled}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                  r.sent ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>{r.sent ? "Sent" : "Scheduled"}</span>
                <button onClick={() => setWiz(w => ({ ...w, reminders: w.reminders.filter((_, ri) => ri !== i) }))}
                  className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={12} />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">Recipients:</div>
            <div className="flex gap-1.5 flex-wrap">
              {RECIPIENTS.map(rc => (
                <button key={rc} onClick={() => toggleRec(i, rc)}
                  className={cn("text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all",
                    r.recipients.includes(rc)
                      ? "bg-sky-50 text-sky-700 border-sky-300"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                  )}>{rc}</button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex gap-3.5">
              {r.excl_sub ? <span className="text-emerald-600">✓ Skip suppliers who submitted</span> : <span>Send to all</span>}
              <span className="text-sky-600">✓ Include portal link</span>
            </div>
          </div>
        ))}
      </div>
    </FormCard>
  );
}

/* ── Step 7: Review ─────────────────────────────────────────────── */
function Step7({ wiz }: { wiz: WizState }) {
  const cfg = TYPE_CONFIG[wiz.type];
  const totalQ = wiz.sections.reduce((s, sec) => s + sec.questions.length, 0);
  const total = wiz.items.reduce((s, it) => s + parseFloat(it.target_price || "0") * parseFloat(it.quantity || "0"), 0);

  const checks = [
    { ok: true, msg: "Event title provided" },
    { ok: true, msg: "Submission deadline set" },
    { ok: wiz.type === "RFI" || wiz.items.length > 0, msg: wiz.type === "RFI" ? "Line items not required for RFI" : wiz.items.length > 0 ? `BOQ / line items added (${wiz.items.length} items)` : `No line items – required for ${wiz.type}` },
    { ok: wiz.participants.length > 0, msg: wiz.participants.length > 0 ? `${wiz.participants.length} suppliers invited` : "No suppliers invited yet" },
    { ok: totalQ > 0, msg: totalQ > 0 ? `Questionnaire configured (${totalQ} questions across ${wiz.sections.length} sections)` : "No questionnaire sections added" },
    { ok: wiz.type !== "RFT" || wiz.toggles.two_envelope_system, msg: wiz.type === "RFT" ? `Two-envelope system ${wiz.toggles.two_envelope_system ? "enabled" : "disabled"}` : `N/A for ${wiz.type}` },
    { ok: wiz.reminders.length > 0, msg: `${wiz.reminders.length} reminder(s) scheduled` },
  ];

  const infoRows = [
    { k: "Event type", v: <TypeBadge type={wiz.type} /> },
    { k: "Event name", v: "Annual Decorative Lighting Contract" },
    { k: "Submission deadline", v: "30 Sep 2025" },
    ...(wiz.type !== "RFI" ? [{ k: "Estimated value", v: "₹50,00,000" }] : []),
    { k: "Line items", v: cfg.showItems ? `${wiz.items.length} items – internal total ₹${total.toLocaleString("en-IN")}` : `Not applicable for ${wiz.type}` },
    ...(wiz.type === "RFT" ? [{ k: "Two-envelope system", v: "Enabled – tech opens 05 Oct, financial opens 15 Oct" }] : []),
    { k: "Participants invited", v: `${wiz.participants.length} suppliers` },
    { k: "Questionnaire", v: `${totalQ} questions, ${wiz.sections.length} sections` },
    { k: "Reminders", v: `${wiz.reminders.length} scheduled` },
  ];

  return (
    <FormCard title="" sub="">
      <InfoBox variant="green">
        <strong>Ready to publish.</strong> Review the summary and checklist. Once published, all invited suppliers receive an invitation notification immediately.
      </InfoBox>
      <h3 className="text-[15px] font-semibold text-slate-900 mb-3.5">Event summary</h3>
      <div className="bg-slate-50 rounded-lg p-4 mb-5 divide-y divide-slate-100">
        {infoRows.map(({ k, v }) => (
          <div key={k} className="flex py-2 gap-4 text-[13px]">
            <span className="text-slate-400 text-[12px] min-w-[170px] flex-shrink-0">{k}</span>
            <span className="text-slate-800 font-medium">{v}</span>
          </div>
        ))}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900 mb-3">Pre-publish checklist</h3>
      <div className="divide-y divide-slate-100">
        {checks.map(({ ok, msg }) => (
          <div key={msg} className="flex items-center gap-2.5 py-2 text-[13px]">
            {ok
              ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              : <X size={14} className="text-red-500 flex-shrink-0" />
            }
            <span className={ok ? "text-slate-800" : "text-red-600"}>{msg}</span>
          </div>
        ))}
      </div>
    </FormCard>
  );
}

/* ── Shared form card wrapper ───────────────────────────────────── */
function FormCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-20">
      {title && <h2 className="text-[16px] font-semibold text-slate-900 mb-1">{title}</h2>}
      {sub && <p className="text-[12px] text-slate-500 mb-5">{sub}</p>}
      {children}
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────────── */
function FieldWrap({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-[12px] font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
