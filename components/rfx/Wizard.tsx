"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InfoBox, SectionLabel, ToggleRow, NotApplicable } from "./shared";
import { SUPPLIER_CATALOGUE, TYPE_CONFIG, DEFAULT_WIZ_STATE } from "@/lib/rfx-data";
import type { WizState, WizItem, WizSection, WizQuestion, EventType, EventFormat, AppView } from "@/lib/rfx-types";
import {
  Check, ChevronLeft, ChevronRight, Plus, Search,
  GripVertical, X, CheckCircle2, FileSearch, LayoutList,
  ShoppingCart, ArrowLeft,
} from "lucide-react";

interface WizardProps {
  onNavigate: (view: AppView) => void;
  onPublish: (wiz: WizState) => void;
}

const QTYPES = ["TEXT", "NUMERIC", "BOOLEAN", "SINGLE_CHOICE", "MULTI_CHOICE", "FILE_UPLOAD", "DATE"];
const QTYPE_LABELS: Record<string, string> = {
  TEXT: "Text", NUMERIC: "Numeric", BOOLEAN: "Boolean",
  SINGLE_CHOICE: "Single Choice", MULTI_CHOICE: "Multi Choice",
  FILE_UPLOAD: "File Upload", DATE: "Date",
};
const SEC_TYPES = ["GENERAL", "TECHNICAL", "COMPLIANCE", "HSE", "FINANCIAL"];

const TOGGLE_DEFS: Record<string, { label: string; sub: string }> = {
  nda_required:               { label: "NDA required",              sub: "Suppliers must sign NDA before accessing event documents." },
  intent_to_participate_req:  { label: "Intent to participate",     sub: "Suppliers must confirm participation before they can submit." },
  allow_supplier_attachments: { label: "Allow supplier attachments",sub: "Suppliers can upload supporting documents with their response." },
  bid_bond_required:          { label: "Bid bond required",         sub: "Suppliers must submit a bid security / earnest money deposit." },
  price_negotiation_enabled:  { label: "Enable price negotiation",  sub: "Buyers can negotiate pricing post-evaluation." },
};

const FORMAT_OPTIONS: Record<EventType, { value: EventFormat; label: string; desc: string }[]> = {
  RFI: [
    { value: "STANDARD",       label: "Standard",       desc: "Single questionnaire sent to all suppliers" },
  ],
  RFP: [
    { value: "LIST",           label: "List",           desc: "Suppliers price a fixed list of deliverables" },
    { value: "CHERRY_PICKING", label: "Cherry Picking", desc: "Best price selected per line across suppliers" },
    { value: "LOT",            label: "Lot-based",      desc: "Deliverables grouped into lots; award per lot" },
    { value: "BID_MATRIX",    label: "Bid Matrix",     desc: "Side-by-side multi-supplier comparison matrix" },
  ],
  RFQ: [
    { value: "LIST",           label: "List",           desc: "Suppliers quote a fixed BOQ line by line" },
    { value: "CHERRY_PICKING", label: "Cherry Picking", desc: "Lowest price cherry-picked per line item" },
    { value: "LOT",            label: "Lot-based",      desc: "BOQ items grouped into lots; award per lot" },
    { value: "BID_MATRIX",    label: "Bid Matrix",     desc: "Matrix view of all supplier quotes" },
  ],
};

const TYPE_META = [
  {
    t: "RFI" as EventType,
    icon: <FileSearch size={22} strokeWidth={1.8} />,
    name: "Request for Information",
    short: "RFI",
    tag: "Market Research",
    desc: "Gather market intelligence and assess supplier capability. No pricing collected.",
    features: ["No BOQ or pricing", "Questionnaire-based", "Soft deadline"],
    accent: { card: "border-violet-300 bg-violet-50/60", icon: "bg-violet-100 text-violet-600", pill: "bg-violet-100 text-violet-700", bar: "bg-violet-400", ring: "ring-violet-300", text: "text-violet-600" },
  },
  {
    t: "RFP" as EventType,
    icon: <LayoutList size={22} strokeWidth={1.8} />,
    name: "Request for Proposal",
    short: "RFP",
    tag: "Proposals",
    desc: "Collect detailed proposals with pricing, methodology and team qualifications.",
    features: ["Optional deliverables", "Weighted evaluation", "Negotiation allowed"],
    accent: { card: "border-sky-300 bg-sky-50/60", icon: "bg-sky-100 text-sky-600", pill: "bg-sky-100 text-sky-700", bar: "bg-sky-400", ring: "ring-sky-300", text: "text-sky-600" },
  },
  {
    t: "RFQ" as EventType,
    icon: <ShoppingCart size={22} strokeWidth={1.8} />,
    name: "Request for Quotation",
    short: "RFQ",
    tag: "Competitive Pricing",
    desc: "Structured BOQ where suppliers quote unit prices. Award goes to lowest qualified bid.",
    features: ["BOQ mandatory", "Bid bond optional", "L1 award"],
    accent: { card: "border-amber-300 bg-amber-50/60", icon: "bg-amber-100 text-amber-600", pill: "bg-amber-100 text-amber-700", bar: "bg-amber-400", ring: "ring-amber-300", text: "text-amber-600" },
  },
] as const;

/* ════════════════════════════════════════════════════════════════════
   Wizard shell
════════════════════════════════════════════════════════════════════ */
export function Wizard({ onNavigate, onPublish }: WizardProps) {
  const [wiz, setWiz] = useState<WizState>({ ...DEFAULT_WIZ_STATE, type: "RFP", format: "LIST" });

  const cfg = TYPE_CONFIG[wiz.type];
  const steps = cfg.steps;
  const isLast = wiz.step === steps.length - 1;
  const meta = TYPE_META.find(m => m.t === wiz.type)!;

  const STEP_MAP: Record<string, () => React.ReactNode> = {
    "Event type":       () => <Step0 wiz={wiz} setWiz={setWiz} />,
    "Basic details":    () => <Step1 wiz={wiz} setWiz={setWiz} />,
    "Deliverables":     () => <Step2 wiz={wiz} setWiz={setWiz} />,
    "Line items (BOQ)": () => <Step2 wiz={wiz} setWiz={setWiz} />,
    "Documents":        () => <Step3 wiz={wiz} />,
    "Questionnaire":    () => <Step4 wiz={wiz} setWiz={setWiz} />,
    "Participants":     () => <Step5 wiz={wiz} setWiz={setWiz} />,
    "Reminders":        () => <Step6 wiz={wiz} setWiz={setWiz} />,
    "Review":           () => <Step7 wiz={wiz} />,
  };

  function handleNext() {
    if (isLast) { onPublish(wiz); } else { setWiz(w => ({ ...w, step: w.step + 1 })); }
  }
  function handlePrev() {
    if (wiz.step === 0) { onNavigate("events"); } else { setWiz(w => ({ ...w, step: w.step - 1 })); }
  }

  return (
    <div className="flex h-full bg-white">

      {/* ── Left sidebar ── */}
      <div className="w-64 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/50">
        {/* Back link */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <button
            onClick={() => onNavigate("events")}
            className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={13} /> Back to events
          </button>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">New Event</div>
            {wiz.step > 0 && (
              <div className={cn("inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg", meta.accent.pill)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", meta.accent.bar)} />
                {meta.name}
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {steps.map((s, i) => {
            const done = i < wiz.step;
            const active = i === wiz.step;
            return (
              <button
                key={s}
                onClick={() => setWiz(w => ({ ...w, step: i }))}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all",
                  active && "bg-white shadow-sm border border-slate-200",
                  !active && "hover:bg-white/60"
                )}
              >
                {/* step dot */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all",
                  active && "bg-slate-900 text-white",
                  done && "bg-emerald-500 text-white",
                  !active && !done && "bg-slate-200 text-slate-400"
                )}>
                  {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className={cn(
                    "text-[13px] font-medium truncate",
                    active && "text-slate-900",
                    done && "text-slate-600",
                    !active && !done && "text-slate-400"
                  )}>{s}</div>
                  {active && (
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{cfg.stepSubs[i]}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{wiz.step + 1} / {steps.length}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-500"
              style={{ width: `${((wiz.step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {STEP_MAP[steps[wiz.step]]?.() ?? null}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-white px-10 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft size={15} /> {wiz.step === 0 ? "Cancel" : "Previous"}
          </button>
          <button
            onClick={handleNext}
            className={cn(
              "flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-xl transition-all",
              isLast
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-700 text-white"
            )}
          >
            {isLast ? <><Check size={14} /> Publish event</> : <>Continue <ChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 0 — Event type + format
════════════════════════════════════════════════════════════════════ */
function Step0({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const selMeta = TYPE_META.find(m => m.t === wiz.type)!;
  const formats = FORMAT_OPTIONS[wiz.type];

  return (
    <div>
      <StepHeader
        title="Select event type"
        sub="Choose the type of sourcing event, then select a bidding format."
      />

      {/* Type cards — 3 columns */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {TYPE_META.map(({ t, icon, name, short, tag, desc, features, accent }) => {
          const sel = wiz.type === t;
          return (
            <button
              key={t}
              onClick={() => setWiz(w => ({ ...w, type: t, format: FORMAT_OPTIONS[t][0].value }))}
              className={cn(
                "text-left p-4 rounded-2xl border-2 transition-all bg-white relative",
                sel ? accent.card : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
              )}
            >
              {/* check */}
              <div className={cn(
                "absolute top-3.5 right-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                sel ? "bg-slate-900 border-slate-900" : "border-slate-200 bg-white"
              )}>
                {sel && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>

              {/* icon */}
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", accent.icon)}>
                {icon}
              </div>

              {/* tag pill */}
              <div className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md inline-block mb-2", accent.pill)}>
                {tag}
              </div>

              <div className="text-[13px] font-bold text-slate-900 mb-1">{short} — {name}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed mb-3">{desc}</div>

              <div className="space-y-1">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <div className={cn("w-1 h-1 rounded-full flex-shrink-0", accent.bar)} />
                    {f}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 1 — Basic details
════════════════════════════════════════════════════════════════════ */
function Step1({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const cfg = TYPE_CONFIG[wiz.type];
  const meta = TYPE_META.find(m => m.t === wiz.type)!;

  return (
    <div>
      <StepHeader title="Basic details" sub="Core event information visible to all invited suppliers." />
      <Card>
        <Field label="Event title" required>
          <Input defaultValue="Annual Decorative Lighting Contract" />
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Reference number">
            <Input readOnly value={`${wiz.type}-2026-0019`} className="bg-slate-50 text-slate-400" />
          </Field>
          <Field label="Category">
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400">
              <option>Electrical</option><option>Civil</option><option>IT</option><option>Facilities</option>
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Description / scope summary">
            <Textarea defaultValue="Supply and installation of decorative lighting for Phase 2 of the HQ renovation project." className="min-h-[72px] resize-none" />
          </Field>
        </div>
      </Card>

      <SectionDivider>Timeline</SectionDivider>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Submission deadline" required>
            <Input type="date" defaultValue="2026-09-30" />
          </Field>
          <Field label="Clarification deadline">
            <Input type="date" defaultValue="2026-09-15" />
          </Field>
        </div>
      </Card>

      {cfg.showPricing && (
        <>
          <SectionDivider>Budget</SectionDivider>
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated contract value (₹)">
                <Input defaultValue="50,00,000" />
                <p className="text-[11px] text-slate-400 mt-1">Internal — not shown to suppliers.</p>
              </Field>
              <Field label="Currency">
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400">
                  <option>INR – Indian Rupee</option>
                  <option>USD – US Dollar</option>
                  <option>EUR – Euro</option>
                </select>
              </Field>
            </div>
          </Card>
        </>
      )}

      <SectionDivider>Event settings</SectionDivider>
      <Card padding={false}>
        {cfg.togglesToShow.map(k => {
          const def = TOGGLE_DEFS[k];
          if (!def) return null;
          const on = wiz.toggles[k as keyof typeof wiz.toggles];
          return (
            <div key={k}>
              <div className="px-5">
                <ToggleRow label={def.label} sub={def.sub} checked={on}
                  onChange={v => setWiz(w => ({ ...w, toggles: { ...w.toggles, [k]: v } }))} />
              </div>
              {k === "bid_bond_required" && on && cfg.showBidBond && (
                <div className="mx-5 mb-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Amount (₹)"><Input defaultValue="1,00,000" /></Field>
                    <Field label="Type">
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] bg-white">
                        <option>Bank Guarantee</option><option>DD / Pay Order</option><option>Insurance Bond</option>
                      </select>
                    </Field>
                    <Field label="Validity (days)"><Input type="number" defaultValue="90" /></Field>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
      {cfg.infoBox && <div className="mt-4"><InfoBox variant="blue">{cfg.infoBox}</InfoBox></div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 2 — Line items / BOQ
════════════════════════════════════════════════════════════════════ */
function Step2({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const cfg = TYPE_CONFIG[wiz.type];

  if (!cfg.showItems) {
    return (
      <div>
        <StepHeader title="Line items" sub="" />
        <Card><NotApplicable>Line items are not applicable for {wiz.type}.</NotApplicable></Card>
      </div>
    );
  }

  function addItem() {
    setWiz(w => ({ ...w, items: [...w.items, { id: Date.now(), item_code: "", description: "", quantity: "1", unit: "PCS", target_price: "", technical_spec: "", required_by: "" }] }));
  }
  function delItem(idx: number) {
    setWiz(w => ({ ...w, items: w.items.filter((_, i) => i !== idx) }));
  }
  function updateItem(idx: number, field: keyof WizItem, val: string) {
    setWiz(w => ({ ...w, items: w.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  }

  return (
    <div>
      <StepHeader title={cfg.itemsLabel ?? "Line items"} sub={cfg.itemsNote ?? ""} />
      {cfg.infoBox && <div className="mb-4"><InfoBox variant="amber">{cfg.infoBox}</InfoBox></div>}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Code", "Description", "Qty", "Unit", cfg.showPricing && "Target ₹", "Required by", ""].filter(Boolean).map(h => (
                  <th key={h as string} className="text-left px-3 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {wiz.items.map((it, i) => (
                <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-2.5 py-2"><Input value={it.item_code} onChange={e => updateItem(i, "item_code", e.target.value)} className="h-8 text-[12px] w-24" placeholder="Code" /></td>
                  <td className="px-2.5 py-2"><Input value={it.description} onChange={e => updateItem(i, "description", e.target.value)} className="h-8 text-[12px]" placeholder="Description" /></td>
                  <td className="px-2.5 py-2"><Input value={it.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className="h-8 text-[12px] w-16" type="number" /></td>
                  <td className="px-2.5 py-2">
                    <select value={it.unit} onChange={e => updateItem(i, "unit", e.target.value)} className="h-8 px-2 border border-slate-200 rounded-lg text-[12px] bg-white">
                      {["PCS","MT","KG","NOS","LOT"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  {cfg.showPricing && <td className="px-2.5 py-2"><Input value={it.target_price} onChange={e => updateItem(i, "target_price", e.target.value)} className="h-8 text-[12px] w-24" placeholder="0.00" /></td>}
                  <td className="px-2.5 py-2"><Input value={it.required_by} onChange={e => updateItem(i, "required_by", e.target.value)} type="date" className="h-8 text-[12px]" /></td>
                  <td className="px-2.5 py-2">
                    <button onClick={() => delItem(i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all">
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {wiz.items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-[12px] text-slate-400 py-10">No items yet. Click "Add item" below.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <button onClick={addItem} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <Plus size={14} /> Add item
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 3 — Documents
════════════════════════════════════════════════════════════════════ */
function Step3({ wiz }: { wiz: WizState }) {
  return (
    <div>
      <StepHeader title="Documents" sub="Upload specifications, NDA, and terms & conditions for suppliers." />
      <Card>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Technical specifications">
            <Input type="file" className="cursor-pointer" />
            <p className="text-[11px] text-slate-400 mt-1">Specs, drawings, or standards to be met.</p>
          </Field>
          <Field label="Terms & conditions">
            <Input type="file" className="cursor-pointer" />
          </Field>
        </div>
        {wiz.toggles.nda_required && (
          <div className="mb-4">
            <Field label="NDA template" required>
              <Input type="file" className="cursor-pointer" />
              <p className="text-[11px] text-slate-400 mt-1">Suppliers must acknowledge before accessing documents.</p>
            </Field>
          </div>
        )}
        <Field label="Additional documents">
          <Input type="file" multiple className="cursor-pointer" />
        </Field>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 4 — Questionnaire
════════════════════════════════════════════════════════════════════ */
function Step4({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  function addSection() {
    setWiz(w => ({ ...w, sections: [...w.sections, { id: Date.now(), title: "New section", type: "GENERAL", mandatory: false, questions: [] }] }));
  }
  function delSection(si: number) {
    setWiz(w => ({ ...w, sections: w.sections.filter((_, i) => i !== si) }));
  }
  function updateSec(si: number, field: keyof WizSection, val: unknown) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, [field]: val } : s) }));
  }
  function addQ(si: number) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: [...s.questions, { id: Date.now(), text: "", qtype: "TEXT", mandatory: false, scored: false, weight: 0 }] } : s) }));
  }
  function delQ(si: number, qi: number) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: s.questions.filter((_, j) => j !== qi) } : s) }));
  }
  function updateQ(si: number, qi: number, field: keyof WizQuestion, val: unknown) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: s.questions.map((q, j) => j === qi ? { ...q, [field]: val } : q) } : s) }));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <StepHeader title="Questionnaire" sub="Scored questions contribute to the technical evaluation score." inline />
        <button onClick={addSection} className="flex items-center gap-1.5 text-[12px] font-semibold bg-slate-900 text-white px-3.5 py-2 rounded-xl hover:bg-slate-700 transition-colors flex-shrink-0">
          <Plus size={13} /> Add section
        </button>
      </div>

      {wiz.sections.length === 0 && (
        <Card><NotApplicable>No sections yet. Click "Add section" to build the questionnaire.</NotApplicable></Card>
      )}

      {wiz.sections.map((sec, si) => (
        <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl mb-3 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 flex-wrap">
            <Input
              defaultValue={sec.title}
              onBlur={e => updateSec(si, "title", e.target.value)}
              className="h-8 text-[13px] font-semibold w-44 flex-shrink-0"
              placeholder="Section title…"
            />
            <select value={sec.type} onChange={e => updateSec(si, "type", e.target.value)} className="h-8 px-2 border border-slate-200 rounded-lg text-[11px] bg-white text-slate-600">
              {SEC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
              <Checkbox checked={sec.mandatory} onCheckedChange={v => updateSec(si, "mandatory", !!v)} /> Required
            </label>
            <div className="ml-auto flex gap-2">
              <button onClick={() => addQ(si)} className="flex items-center gap-1 text-[11px] font-medium text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <Plus size={11} /> Question
              </button>
              <button onClick={() => delSection(si)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="divide-y divide-slate-50">
            {sec.questions.length === 0 && (
              <p className="text-[12px] text-slate-400 px-4 py-4">No questions yet.</p>
            )}
            {sec.questions.map((q, qi) => (
              <div key={q.id} className="flex flex-wrap items-center gap-2.5 px-4 py-3">
                <GripVertical size={13} className="text-slate-200 cursor-grab flex-shrink-0" />
                <Input defaultValue={q.text} onBlur={e => updateQ(si, qi, "text", e.target.value)} className="h-8 text-[12px] flex-1 min-w-36" placeholder="Question text…" />
                <select value={q.qtype} onChange={e => updateQ(si, qi, "qtype", e.target.value)} className="h-8 px-2 border border-slate-200 rounded-lg text-[11px] bg-white text-slate-600">
                  {QTYPES.map(t => <option key={t} value={t}>{QTYPE_LABELS[t]}</option>)}
                </select>
                <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                  <Checkbox checked={q.mandatory} onCheckedChange={v => updateQ(si, qi, "mandatory", !!v)} /> Req
                </label>
                <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                  <Checkbox checked={q.scored} onCheckedChange={v => updateQ(si, qi, "scored", !!v)} /> Scored
                </label>
                {q.scored && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Input type="number" min="0" max="100" defaultValue={q.weight ?? 0} onBlur={e => updateQ(si, qi, "weight", parseInt(e.target.value) || 0)} className="h-7 w-12 text-[11px] text-center" />%
                  </div>
                )}
                <button onClick={() => delQ(si, qi)} className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all flex-shrink-0">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 5 — Participants
════════════════════════════════════════════════════════════════════ */
function Step5({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const already = wiz.participants.map(p => p.name);
  const catalogue = SUPPLIER_CATALOGUE.filter(s => !already.includes(s.name));
  const filtered = wiz._inviteSearch
    ? catalogue.filter(s => s.name.toLowerCase().includes(wiz._inviteSearch!.toLowerCase()) || s.country.toLowerCase().includes(wiz._inviteSearch!.toLowerCase()))
    : catalogue;

  const STATUS_STYLE: Record<string, string> = {
    INVITED: "bg-indigo-50 text-indigo-600", ACCEPTED: "bg-emerald-50 text-emerald-600",
    SUBMITTED: "bg-emerald-50 text-emerald-600", DECLINED: "bg-red-50 text-red-500",
  };
  const counts = { INVITED: 0, ACCEPTED: 0, SUBMITTED: 0, DECLINED: 0 };
  wiz.participants.forEach(p => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });

  function toggleSelect(name: string) {
    setWiz(w => { const sel = w._inviteSelected ?? []; return { ...w, _inviteSelected: sel.includes(name) ? sel.filter(n => n !== name) : [...sel, name] }; });
  }
  function confirmInvite() {
    const sel = wiz._inviteSelected ?? [];
    const newP = SUPPLIER_CATALOGUE.filter(s => sel.includes(s.name)).map((s, i) => ({ id: Date.now() + i, name: s.name, country: s.country, status: "INVITED" as const }));
    setWiz(w => ({ ...w, participants: [...w.participants, ...newP], _inviteOpen: false, _inviteSearch: "", _inviteSelected: [] }));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <StepHeader title="Participants" sub="Invite suppliers — they'll be notified when the event is published." inline />
        <button onClick={() => setWiz(w => ({ ...w, _inviteOpen: true, _inviteSearch: "", _inviteSelected: [] }))} className="flex items-center gap-1.5 text-[12px] font-semibold bg-slate-900 text-white px-3.5 py-2 rounded-xl hover:bg-slate-700 transition-colors flex-shrink-0">
          <Plus size={13} /> Invite suppliers
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[{ v: wiz.participants.length, l: "Total" }, { v: counts.INVITED, l: "Invited" }, { v: counts.ACCEPTED, l: "Accepted" }, { v: counts.SUBMITTED, l: "Submitted" }].map(({ v, l }) => (
          <div key={l} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className="text-[22px] font-bold text-slate-900">{v}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Invite panel */}
      {wiz._inviteOpen && (
        <div className="border-2 border-slate-900 rounded-2xl p-5 mb-5 bg-slate-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[14px] font-bold text-slate-900">Add suppliers</div>
              <div className="text-[12px] text-slate-400 mt-0.5">Search and select suppliers to invite.</div>
            </div>
            <button onClick={() => setWiz(w => ({ ...w, _inviteOpen: false }))} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 transition-all">
              <X size={14} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by name or country…" value={wiz._inviteSearch ?? ""} onChange={e => setWiz(w => ({ ...w, _inviteSearch: e.target.value }))} className="pl-8 bg-white" />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {filtered.length === 0
              ? <p className="text-center text-[12px] text-slate-400 py-4">No suppliers found.</p>
              : filtered.map(s => {
                  const checked = (wiz._inviteSelected ?? []).includes(s.name);
                  return (
                    <div key={s.name} onClick={() => toggleSelect(s.name)}
                      className={cn("flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer border transition-all", checked ? "bg-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-300")}
                    >
                      <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all", checked ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300")}>
                        {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="flex-1 text-[13px] font-medium text-slate-800">{s.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{s.country}</span>
                    </div>
                  );
                })
            }
          </div>
          {(wiz._inviteSelected?.length ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
              <button onClick={confirmInvite} className="text-[12px] font-semibold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors">
                Send invitations ({wiz._inviteSelected!.length})
              </button>
              <span className="text-[11px] text-slate-400">Invites go out when the event is published.</span>
            </div>
          )}
        </div>
      )}

      {/* Participant list */}
      {wiz.participants.length === 0
        ? <Card><NotApplicable>No suppliers invited yet.</NotApplicable></Card>
        : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Supplier", "Country", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {wiz.participants.map((p, pi) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{p.country}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg", STATUS_STYLE[p.status] ?? "bg-slate-100 text-slate-500")}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setWiz(w => ({ ...w, participants: w.participants.filter((_, i) => i !== pi) }))} className="text-[11px] text-slate-400 hover:text-red-500 transition-colors">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 6 — Reminders
════════════════════════════════════════════════════════════════════ */
function Step6({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const RECIPIENTS = ["MANAGER", "STAKEHOLDER", "SUPPLIER"];

  function toggleRec(i: number, rc: string) {
    setWiz(w => ({ ...w, reminders: w.reminders.map((r, ri) => ri !== i ? r : { ...r, recipients: r.recipients.includes(rc) ? r.recipients.filter(x => x !== rc) : [...r.recipients, rc] }) }));
  }
  function addReminder() {
    setWiz(w => ({ ...w, reminders: [...w.reminders, { id: Date.now(), headline: "New reminder", scheduled: "2026-09-25T09:00", recipients: ["SUPPLIER"], sent: false, excl_sub: true }] }));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <StepHeader title="Reminders" sub="Schedule supplemental notifications for this event." inline />
        <button onClick={addReminder} className="flex items-center gap-1.5 text-[12px] font-semibold bg-slate-900 text-white px-3.5 py-2 rounded-xl hover:bg-slate-700 transition-colors flex-shrink-0">
          <Plus size={13} /> Add reminder
        </button>
      </div>
      <div className="mb-4"><InfoBox variant="blue">System notifications (event cancelled, supplier awarded, etc.) always send regardless of these settings.</InfoBox></div>

      {wiz.reminders.length === 0 && <Card><NotApplicable>No reminders yet.</NotApplicable></Card>}

      <div className="space-y-3">
        {wiz.reminders.map((r, i) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{r.headline}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.scheduled}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-lg tracking-wide", r.sent ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{r.sent ? "Sent" : "Scheduled"}</span>
                <button onClick={() => setWiz(w => ({ ...w, reminders: w.reminders.filter((_, ri) => ri !== i) }))} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all">
                  <X size={12} />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">Recipients</div>
            <div className="flex gap-1.5">
              {RECIPIENTS.map(rc => (
                <button key={rc} onClick={() => toggleRec(i, rc)} className={cn("text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all", r.recipients.includes(rc) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>{rc}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step 7 — Review
════════════════════════════════════════════════════════════════════ */
function Step7({ wiz }: { wiz: WizState }) {
  const cfg = TYPE_CONFIG[wiz.type];
  const meta = TYPE_META.find(m => m.t === wiz.type)!;
  const totalQ = wiz.sections.reduce((s, sec) => s + sec.questions.length, 0);
  const total = wiz.items.reduce((s, it) => s + parseFloat(it.target_price || "0") * parseFloat(it.quantity || "0"), 0);
  const fmtLabel = FORMAT_OPTIONS[wiz.type].find(f => f.value === wiz.format)?.label ?? "—";

  const checks = [
    { ok: true,                        label: "Event title provided" },
    { ok: true,                        label: "Submission deadline set" },
    { ok: wiz.type === "RFI" || wiz.items.length > 0, label: wiz.type === "RFI" ? "Line items not required for RFI" : wiz.items.length > 0 ? `${wiz.items.length} line items added` : "No line items — required" },
    { ok: wiz.participants.length > 0, label: wiz.participants.length > 0 ? `${wiz.participants.length} suppliers invited` : "No suppliers invited yet" },
    { ok: totalQ > 0,                  label: totalQ > 0 ? `${totalQ} questions in ${wiz.sections.length} sections` : "No questionnaire sections" },
    { ok: wiz.reminders.length > 0,    label: `${wiz.reminders.length} reminder(s) scheduled` },
  ];
  const allOk = checks.every(c => c.ok);

  const rows = [
    { label: "Type",         value: <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-lg", meta.accent.pill)}>{meta.short}</span> },
    { label: "Format",       value: fmtLabel },
    { label: "Event name",   value: "Annual Decorative Lighting Contract" },
    { label: "Deadline",     value: "30 Sep 2026" },
    ...(cfg.showPricing ? [{ label: "Est. value", value: "₹50,00,000" }] : []),
    { label: "Line items",   value: cfg.showItems ? `${wiz.items.length} items / ₹${total.toLocaleString("en-IN")}` : "N/A" },
    { label: "Suppliers",    value: `${wiz.participants.length} invited` },
    { label: "Questionnaire",value: `${totalQ} questions, ${wiz.sections.length} sections` },
    { label: "Reminders",    value: `${wiz.reminders.length} scheduled` },
  ];

  return (
    <div>
      <StepHeader title="Review & publish" sub="Check everything looks correct before going live." />

      <div className={cn("flex items-center gap-3 p-3.5 rounded-xl mb-4 border", allOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
        {allOk
          ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
          : <X size={18} className="text-amber-500 flex-shrink-0" />
        }
        <span className={cn("text-[13px] font-semibold", allOk ? "text-emerald-700" : "text-amber-700")}>
          {allOk ? "All checks passed — ready to publish." : "Some items need attention before publishing."}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Summary */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Event summary</div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                <span className="text-[12px] text-slate-400">{label}</span>
                <span className="text-[12px] font-semibold text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Pre-publish checklist</div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {checks.map(({ ok, label }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", ok ? "bg-emerald-500" : "bg-red-400")}>
                  {ok ? <Check size={9} className="text-white" strokeWidth={3} /> : <X size={9} className="text-white" strokeWidth={3} />}
                </div>
                <span className={cn("text-[12px]", ok ? "text-slate-700" : "text-red-600")}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Shared primitives
════════════════════════════════════════════════════════════════════ */
function StepHeader({ title, sub, inline }: { title: string; sub: string; inline?: boolean }) {
  if (inline) return (
    <div>
      <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
  return (
    <div className="mb-4">
      <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ children, padding = true }: { children: React.ReactNode; padding?: boolean }) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl", padding && "p-4")}>
      {children}
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[12px] font-semibold text-slate-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
