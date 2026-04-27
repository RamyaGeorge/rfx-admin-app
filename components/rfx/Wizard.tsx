"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InfoBox, ToggleRow, NotApplicable } from "./shared";
import { SUPPLIER_CATALOGUE, TYPE_CONFIG, DEFAULT_WIZ_STATE } from "@/lib/rfx-data";
import type { TemplateWizData } from "@/lib/rfx-data";
import type { WizState, WizItem, WizSection, WizQuestion, EventType, EventFormat, AppView, WizEvaluator, WizReminder } from "@/lib/rfx-types";
import {
  Check, ChevronLeft, ChevronRight, Plus, Search,
  GripVertical, X, CheckCircle2, FileSearch, LayoutList,
  ShoppingCart, ArrowLeft, Sparkles, Loader2, Pencil, Trash2, LayoutTemplate,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  IndentDecrease, IndentIncrease, AlignLeft, AlignCenter, Baseline, RemoveFormatting,
  Undo2, Redo2,
} from "lucide-react";

interface WizardProps {
  onNavigate: (view: AppView) => void;
  onPublish: (wiz: WizState) => void;
  template?: TemplateWizData;
}

/* ── Rich Text Editor ──────────────────────────────────────────────── */
function RteButton({ onAction, title, active, children }: {
  onAction: () => void; title: string; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onAction(); }}
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        "[&_svg]:size-3.5"
      )}
    >
      {children}
    </button>
  );
}

function RteDivider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

const RTE_COLORS = [
  ["#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#ffffff"],
  ["#ff0000","#ff4500","#ff9900","#ffff00","#00ff00","#00ffff","#4a86e8","#9900ff"],
  ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
  ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
  ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
  ["#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c8","#674ea7","#a61c00"],
  ["#990000","#b45f06","#bf9000","#38761d","#134f5c","#1155cc","#351c75","#741b47"],
  ["#660000","#783f04","#7f6000","#274e13","#0c343d","#1c4587","#20124d","#4c1130"],
];

function RichTextEditor({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);
  const [colorOpen, setColorOpen] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const colorPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!colorOpen) return;
    function handleClick(e: MouseEvent) {
      if (!colorPanelRef.current?.contains(e.target as Node)) setColorOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [colorOpen]);

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value ?? undefined);
    forceUpdate(n => n + 1);
  }

  function isActive(cmd: string) {
    try { return document.queryCommandState(cmd); } catch { return false; }
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
  }

  function applyColor(hex: string) {
    setColorOpen(false);
    const sel = window.getSelection();
    if (savedSelectionRef.current) {
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
    editorRef.current?.focus();
    document.execCommand("foreColor", false, hex);
    forceUpdate(n => n + 1);
  }

  return (
    <div className="rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
        <RteButton onAction={() => exec("undo")} title="Undo"><Undo2 /></RteButton>
        <RteButton onAction={() => exec("redo")} title="Redo"><Redo2 /></RteButton>
        <RteDivider />
        <RteButton onAction={() => exec("bold")} title="Bold" active={isActive("bold")}><Bold /></RteButton>
        <RteButton onAction={() => exec("italic")} title="Italic" active={isActive("italic")}><Italic /></RteButton>
        <RteButton onAction={() => exec("underline")} title="Underline" active={isActive("underline")}><Underline /></RteButton>
        <RteButton onAction={() => exec("strikeThrough")} title="Strikethrough" active={isActive("strikeThrough")}><Strikethrough /></RteButton>
        <RteDivider />
        <RteButton onAction={() => exec("insertOrderedList")} title="Numbered list" active={isActive("insertOrderedList")}><ListOrdered /></RteButton>
        <RteButton onAction={() => exec("insertUnorderedList")} title="Bullet list" active={isActive("insertUnorderedList")}><List /></RteButton>
        <RteButton onAction={() => exec("outdent")} title="Outdent"><IndentDecrease /></RteButton>
        <RteButton onAction={() => exec("indent")} title="Indent"><IndentIncrease /></RteButton>
        <RteDivider />
        <RteButton onAction={() => exec("justifyLeft")} title="Align left" active={isActive("justifyLeft")}><AlignLeft /></RteButton>
        <RteButton onAction={() => exec("justifyCenter")} title="Align center" active={isActive("justifyCenter")}><AlignCenter /></RteButton>
        <RteDivider />

        {/* Color picker button */}
        <div className="relative">
          <button
            type="button"
            title="Text color"
            onMouseDown={e => {
              e.preventDefault();
              saveSelection();
              setColorOpen(o => !o);
            }}
            className={cn(
              "inline-flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground [&_svg]:size-3.5",
              colorOpen && "bg-accent text-accent-foreground"
            )}
          >
            <Baseline />
          </button>
          {colorOpen && (
            <div
              ref={colorPanelRef}
              className="absolute left-0 top-8 z-50 p-2 bg-popover border border-border rounded-lg shadow-lg"
            >
              {RTE_COLORS.map((row, ri) => (
                <div key={ri} className="flex gap-1 mb-1 last:mb-0">
                  {row.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      title={hex}
                      onMouseDown={e => { e.preventDefault(); applyColor(hex); }}
                      className="w-5 h-5 rounded-sm border border-black/10 hover:scale-110 transition-transform flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <RteButton onAction={() => exec("removeFormat")} title="Clear formatting"><RemoveFormatting /></RteButton>
      </div>
      {/* Content area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => forceUpdate(n => n + 1)}
        className={cn(
          "min-h-[96px] max-h-64 overflow-y-auto px-3 py-2.5",
          "text-sm text-foreground leading-relaxed focus:outline-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_b]:font-semibold [&_strong]:font-semibold"
        )}
      />
    </div>
  );
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
  two_envelope_system:        { label: "Two-envelope system",       sub: "Technical and financial bids are sealed separately and opened in sequence." },
  bid_bond_required:          { label: "Bid bond required",         sub: "Suppliers must submit a bid security / earnest money deposit." },
  site_visit_required:        { label: "Site visit required",       sub: "Suppliers must attend a mandatory site visit or pre-bid meeting." },
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
   Category list (used in Step 1 and Step 4 AI suggest)
════════════════════════════════════════════════════════════════════ */
const PROCUREMENT_CATEGORIES = [
  "IT & Software", "Construction & Civil", "Electrical & Instrumentation",
  "Facility Management", "Logistics & Transport", "Medical & Healthcare",
  "Marketing & Communications", "HR & Staffing", "Legal & Compliance",
  "Finance & Accounting",
];

/* AI-suggested section+question templates per category */
type AISuggestedSection = { title: string; type: string; questions: { text: string; qtype: string; mandatory: boolean; scored: boolean; weight?: number }[] };

const AI_SUGGESTED_SECTIONS: Record<string, AISuggestedSection[]> = {
  "IT & Software": [
    { title: "Technical Compliance", type: "TECHNICAL", questions: [
      { text: "List the software modules / components being offered", qtype: "TEXT", mandatory: true, scored: false },
      { text: "Is the solution cloud-hosted (SaaS) or on-premise?", qtype: "SINGLE_CHOICE", mandatory: true, scored: true, weight: 15 },
      { text: "Upload system architecture diagram", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Describe data encryption at rest and in transit", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Years of experience delivering similar IT solutions", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Upload ISO 27001 or equivalent security certification", qtype: "FILE_UPLOAD", mandatory: false, scored: true, weight: 10 },
      { text: "Provide a list of at least 3 reference clients with contact details", qtype: "TEXT", mandatory: true, scored: false },
    ]},
    { title: "Financial", type: "FINANCIAL", questions: [
      { text: "Provide annual license cost breakdown per user tier", qtype: "NUMERIC", mandatory: true, scored: false },
      { text: "State implementation and professional services cost", qtype: "NUMERIC", mandatory: true, scored: false },
      { text: "Annual Maintenance & Support cost as % of license fee", qtype: "NUMERIC", mandatory: true, scored: false },
    ]},
  ],
  "Construction & Civil": [
    { title: "Technical Compliance", type: "TECHNICAL", questions: [
      { text: "Describe the construction methodology proposed", qtype: "TEXT", mandatory: true, scored: true, weight: 20 },
      { text: "Upload structural drawings or shop drawings", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Specify materials to be used with grade/standard", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Proposed project duration (weeks)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "HSE & Compliance", type: "HSE", questions: [
      { text: "Upload valid HSE plan for the project", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Describe your LTIFR (Lost Time Injury Frequency Rate) for the last 3 years", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
      { text: "Is your firm registered with CPWD / state PWD?", qtype: "BOOLEAN", mandatory: true, scored: false },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Years of experience in civil construction", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Largest project value completed (₹ Cr)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Upload list of projects completed in last 5 years", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
    ]},
  ],
  "Electrical & Instrumentation": [
    { title: "Technical Compliance", type: "TECHNICAL", questions: [
      { text: "Describe the scope of electrical/instrumentation work", qtype: "TEXT", mandatory: true, scored: true, weight: 20 },
      { text: "Upload single-line diagram (SLD) or P&ID", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Specify equipment make and model for major items", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Confirm compliance with IS/IEC standards applicable", qtype: "BOOLEAN", mandatory: true, scored: false },
    ]},
    { title: "HSE & Compliance", type: "HSE", questions: [
      { text: "Upload valid electrical license (Class A contractor)", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Describe safe work method statement for live panel work", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Years in electrical contracting", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Number of licensed electricians on roll", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
    ]},
  ],
  "Facility Management": [
    { title: "Service Scope", type: "TECHNICAL", questions: [
      { text: "List all facility services to be provided", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Proposed staffing plan for the facility", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Describe quality management / SLA monitoring process", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Compliance", type: "COMPLIANCE", questions: [
      { text: "Upload valid contract labour license under CLRA", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Confirm PF and ESI registration", qtype: "BOOLEAN", mandatory: true, scored: false },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Number of facilities currently managed", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Provide reference list from last 3 years", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
    ]},
  ],
  "Logistics & Transport": [
    { title: "Operational Capability", type: "TECHNICAL", questions: [
      { text: "Describe your fleet size and vehicle types available", qtype: "TEXT", mandatory: true, scored: true, weight: 20 },
      { text: "Provide coverage map / serviceable pin codes", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Average transit time for primary lane (source to destination)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
      { text: "Do you offer real-time GPS tracking?", qtype: "BOOLEAN", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Compliance", type: "COMPLIANCE", questions: [
      { text: "Upload valid motor vehicle permits and fitness certificates", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Confirm GST registration", qtype: "BOOLEAN", mandatory: true, scored: false },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Years in logistics / transport business", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Peak monthly volume handled (units/shipments)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
    ]},
  ],
  "Medical & Healthcare": [
    { title: "Technical Specifications", type: "TECHNICAL", questions: [
      { text: "Provide detailed product specification sheet", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "State country of origin and manufacturer name", qtype: "TEXT", mandatory: true, scored: false },
      { text: "Describe after-sales service and preventive maintenance offering", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Warranty period offered (months)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Regulatory Compliance", type: "COMPLIANCE", questions: [
      { text: "Upload CDSCO registration / import license", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Confirm CE / FDA / ISO 13485 certification", qtype: "BOOLEAN", mandatory: true, scored: true, weight: 15 },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Number of years supplying to hospitals / healthcare", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Provide list of major hospital clients", qtype: "FILE_UPLOAD", mandatory: false, scored: false },
    ]},
  ],
  "Marketing & Communications": [
    { title: "Creative & Strategy", type: "TECHNICAL", questions: [
      { text: "Describe your proposed campaign strategy", qtype: "TEXT", mandatory: true, scored: true, weight: 25 },
      { text: "Upload portfolio / case studies from similar campaigns", qtype: "FILE_UPLOAD", mandatory: true, scored: true, weight: 20 },
      { text: "Proposed media plan and channel mix", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
    ]},
    { title: "Team & Credentials", type: "GENERAL", questions: [
      { text: "Describe the team that will handle this account", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
      { text: "Agency awards or recognitions in last 3 years", qtype: "TEXT", mandatory: false, scored: false },
    ]},
  ],
  "HR & Staffing": [
    { title: "Service Delivery", type: "TECHNICAL", questions: [
      { text: "Describe your sourcing and screening methodology", qtype: "TEXT", mandatory: true, scored: true, weight: 20 },
      { text: "Average time-to-fill for the roles required", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
      { text: "Replacement guarantee period (days)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Compliance", type: "COMPLIANCE", questions: [
      { text: "Upload valid contract labour license", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Confirm PF / ESI / professional tax compliance", qtype: "BOOLEAN", mandatory: true, scored: false },
    ]},
    { title: "Company Profile", type: "GENERAL", questions: [
      { text: "Number of contractors currently on payroll", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      { text: "Key industries served", qtype: "TEXT", mandatory: false, scored: false },
    ]},
  ],
  "Legal & Compliance": [
    { title: "Professional Capability", type: "TECHNICAL", questions: [
      { text: "Describe relevant experience in the required practice area", qtype: "TEXT", mandatory: true, scored: true, weight: 25 },
      { text: "Names and qualifications of lead lawyers assigned", qtype: "TEXT", mandatory: true, scored: true, weight: 20 },
      { text: "Upload bar council registration / firm registration proof", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
    ]},
    { title: "Conflict of Interest", type: "COMPLIANCE", questions: [
      { text: "Confirm no conflict of interest with our organisation", qtype: "BOOLEAN", mandatory: true, scored: false },
      { text: "List any current engagements with competitors", qtype: "TEXT", mandatory: true, scored: false },
    ]},
  ],
  "Finance & Accounting": [
    { title: "Technical Capability", type: "TECHNICAL", questions: [
      { text: "Describe relevant engagement experience (industry & scale)", qtype: "TEXT", mandatory: true, scored: true, weight: 25 },
      { text: "Names and designations of engagement partners", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      { text: "Upload firm registration certificate (ICAI / ICSI)", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      { text: "Describe methodology and tools used", qtype: "TEXT", mandatory: true, scored: true, weight: 10 },
    ]},
    { title: "Independence & Compliance", type: "COMPLIANCE", questions: [
      { text: "Confirm independence from the auditee as per applicable standards", qtype: "BOOLEAN", mandatory: true, scored: false },
      { text: "List any regulatory actions or penalties in last 5 years", qtype: "TEXT", mandatory: true, scored: false },
    ]},
  ],
};

/* ════════════════════════════════════════════════════════════════════
   Wizard shell
════════════════════════════════════════════════════════════════════ */
function initFromTemplate(t: TemplateWizData): WizState {
  return {
    ...DEFAULT_WIZ_STATE,
    step: 1,
    type: t.type,
    format: FORMAT_OPTIONS[t.type]?.[0]?.value ?? "LIST",
    category: t.category,
    deadline: "",
    toggles: {
      nda_required: false,
      intent_to_participate_req: false,
      allow_supplier_attachments: false,
      two_envelope_system: false,
      bid_bond_required: false,
      site_visit_required: false,
      price_negotiation_enabled: false,
    },
    techWeight: undefined,
    commercialWeight: undefined,
    bidValidityDays: undefined,
    taxInclusive: undefined,
    siteVisitDate: "",
    siteVisitLocation: "",
    sections: t.sections.map(s => ({ ...s, questions: s.questions.map(q => ({ ...q })) })),
    items: [],
    participants: [],
    reminders: [],
    evaluators: [],
    _templateName: t.name,
  };
}

export function Wizard({ onNavigate, onPublish, template }: WizardProps) {
  const [wiz, setWiz] = useState<WizState>(() =>
    template ? initFromTemplate(template) : { ...DEFAULT_WIZ_STATE, type: "RFP", format: "LIST" }
  );

  const cfg = TYPE_CONFIG[wiz.type];
  const steps = cfg.steps;
  const isLast = wiz.step === steps.length - 1;
  const meta = TYPE_META.find(m => m.t === wiz.type)!;

  const STEP_MAP: Record<string, () => React.ReactNode> = {
    "Event type":    () => <Step0 wiz={wiz} setWiz={setWiz} />,
    "Basic details": () => <Step1 wiz={wiz} setWiz={setWiz} />,
    "Bid Matrix":    () => <Step2 wiz={wiz} setWiz={setWiz} />,
    "Documents":     () => <Step3 wiz={wiz} />,
    "Questionnaire": () => <Step4 wiz={wiz} setWiz={setWiz} />,
    "Stakeholders":  () => <StepEvaluators wiz={wiz} setWiz={setWiz} />,
    "Suppliers":     () => <Step5 wiz={wiz} setWiz={setWiz} />,
    "Reminders":     () => <Step6 wiz={wiz} setWiz={setWiz} />,
    "Review":        () => <Step7 wiz={wiz} />,
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
                  active && "bg-primary text-white",
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
              className="h-full bg-primary rounded-full transition-all duration-500"
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
                ? "bg-primary hover:bg-primary/80 text-primary-foreground"
                : "bg-primary hover:bg-primary/80 text-primary-foreground"
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
  return (
    <div>
      <StepHeader
        title="Select event type"
        sub="Choose the type of sourcing event that matches your procurement need."
      />

      <div className="grid grid-cols-3 gap-3">
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
              <div className={cn(
                "absolute top-3.5 right-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                sel ? "bg-primary border-primary" : "border-slate-200 bg-white"
              )}>
                {sel && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", accent.icon)}>
                {icon}
              </div>
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
  const fromTemplate = !!wiz._templateName;

  return (
    <div>
      <StepHeader title="Basic details" sub="Core event information visible to all invited suppliers." />
      {fromTemplate && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
          <LayoutTemplate size={13} className="text-primary flex-shrink-0" />
          <span className="text-[12px] text-primary font-medium">
            Pre-filled from template <strong>{wiz._templateName}</strong> — fill in the details below to continue.
          </span>
        </div>
      )}
      <Card>
        <Field label="Event title" required>
          <Input
            placeholder="Enter event title…"
            defaultValue={fromTemplate ? "" : "Annual Decorative Lighting Contract"}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Reference number">
            <Input readOnly value={`${wiz.type}-2026-0019`} className="bg-slate-50 text-slate-400" />
          </Field>
          <Field label="Category">
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400"
              value={wiz.category}
              onChange={e => setWiz(w => ({ ...w, category: e.target.value }))}
            >
              <option value="">Select category…</option>
              {PROCUREMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Description / scope summary">
            <RichTextEditor
              defaultValue={fromTemplate ? "" : "Supply and installation of decorative lighting for Phase 2 of the HQ renovation project."}
              placeholder={fromTemplate ? "Enter a description or scope summary…" : ""}
            />
          </Field>
        </div>
      </Card>

      <SectionDivider>Timeline</SectionDivider>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Submission deadline" required>
            <DateTimePicker
              value={wiz.deadline ?? (fromTemplate ? "" : "2026-09-30T00:00")}
              onChange={val => setWiz(w => ({ ...w, deadline: val }))}
            />
          </Field>
          <Field label="Clarification deadline">
            <DateTimePicker defaultValue={fromTemplate ? "" : "2026-09-15T00:00"} />
          </Field>
        </div>
      </Card>

      {cfg.showPricing && (
        <>
          <SectionDivider>Budget</SectionDivider>
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated contract value (₹)">
                <Input defaultValue={fromTemplate ? "" : "50,00,000"} placeholder={fromTemplate ? "e.g. 50,00,000" : ""} />
                <p className="text-[11px] text-slate-400 mt-1">Internal — not shown to suppliers.</p>
              </Field>
              <Field label="Currency">
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400">
                  <option value="">Select currency…</option>
                  <option>INR – Indian Rupee</option>
                  <option>USD – US Dollar</option>
                  <option>EUR – Euro</option>
                </select>
              </Field>
              <Field label="Bid validity (days)" required>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 90"
                  value={wiz.bidValidityDays ?? ""}
                  onChange={e => setWiz(w => ({ ...w, bidValidityDays: parseInt(e.target.value) || undefined }))}
                />
                <p className="text-[11px] text-slate-400 mt-1">Number of days suppliers must hold their quoted price.</p>
              </Field>
            </div>
          </Card>
        </>
      )}

      {wiz.type === "RFP" && (
        <>
          <SectionDivider>Evaluation methodology</SectionDivider>
          <Card>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Technical weight (%)">
                <Input type="number" value={wiz.techWeight ?? ""} onChange={e => {
                  const t = parseInt(e.target.value) || 0;
                  setWiz(w => ({ ...w, techWeight: t, commercialWeight: 100 - t }));
                }} min={0} max={100} placeholder="e.g. 70" />
                <p className="text-[11px] text-slate-400 mt-1">Remaining {wiz.commercialWeight ?? 0}% is commercial weight.</p>
              </Field>
              <Field label="Min. qualification score (%)">
                <Input type="number" defaultValue={fromTemplate ? "" : "70"} placeholder={fromTemplate ? "e.g. 70" : ""} min={0} max={100} />
                <p className="text-[11px] text-slate-400 mt-1">Suppliers below this score are excluded from commercial evaluation.</p>
              </Field>
              <Field label="Award basis">
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400">
                  <option>Weighted score (technical + commercial)</option>
                  <option>Lowest evaluated cost</option>
                  <option>Best value for money</option>
                </select>
              </Field>
            </div>
          </Card>
        </>
      )}

      {wiz.type === "RFQ" && (
        <>
          <SectionDivider>Award basis</SectionDivider>
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Award method">
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-slate-400">
                  <option>L1 — Lowest qualified bid</option>
                  <option>L1 per lot</option>
                  <option>L1 per line item (cherry pick)</option>
                </select>
              </Field>
              <Field label="Min. qualification score (%)">
                <Input type="number" defaultValue={fromTemplate ? "" : "70"} placeholder={fromTemplate ? "e.g. 70" : ""} min={0} max={100} />
                <p className="text-[11px] text-slate-400 mt-1">Suppliers below this score are excluded from price comparison.</p>
              </Field>
              <Field label="Bid validity (days)" required>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 90"
                  value={wiz.bidValidityDays ?? ""}
                  onChange={e => setWiz(w => ({ ...w, bidValidityDays: parseInt(e.target.value) || undefined }))}
                />
                <p className="text-[11px] text-slate-400 mt-1">Number of days suppliers must hold their quoted price.</p>
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
              {k === "two_envelope_system" && on && (
                <div className="mx-5 mb-3 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Technical envelope opening date">
                      <DateTimePicker defaultValue="2026-10-05T10:00" />
                    </Field>
                    <Field label="Financial envelope opening date">
                      <DateTimePicker defaultValue="2026-10-15T10:00" />
                    </Field>
                  </div>
                </div>
              )}
              {k === "site_visit_required" && on && (
                <div className="mx-5 mb-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date & Time"><DateTimePicker value={wiz.siteVisitDate} onChange={val => setWiz(w => ({ ...w, siteVisitDate: val }))} /></Field>
                    <Field label="Location / Virtual Link"><Input value={wiz.siteVisitLocation} onChange={e => setWiz(w => ({ ...w, siteVisitLocation: e.target.value }))} placeholder="e.g. HQ Lobby or Teams link" /></Field>
                  </div>
                </div>
              )}
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
      {cfg.infoBox && <div className="mt-4"><InfoBox variant={wiz.type === "RFQ" ? "amber" : "blue"}>{cfg.infoBox}</InfoBox></div>}
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
      {cfg.showPricing && (
        <div className="mb-4 flex items-center justify-end">
          <label className="text-[12px] text-slate-600 mr-2 font-medium">Pricing is:</label>
          <select 
            value={wiz.taxInclusive ? "inclusive" : "exclusive"}
            onChange={e => setWiz(w => ({ ...w, taxInclusive: e.target.value === "inclusive" }))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] bg-white text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="exclusive">Exclusive of Taxes</option>
            <option value="inclusive">Inclusive of Taxes</option>
          </select>
        </div>
      )}
      {wiz.type === "RFQ" && wiz.items.length === 0 && (
        <div className="mb-4">
          <InfoBox variant="amber">
            <strong>Bid Matrix is mandatory for RFQ.</strong> Suppliers cannot submit without items to price. Add at least one line item below.
          </InfoBox>
        </div>
      )}
      {wiz.type === "RFP" && (
        <div className="mb-4">
          <InfoBox variant="blue">
            Bid Matrix items are <strong>optional</strong> for RFP. Add items if you want line-level pricing from suppliers, or skip this step to collect open-form proposals only.
          </InfoBox>
        </div>
      )}
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
                  <td className="px-2.5 py-2"><DateTimePicker value={it.required_by} onChange={val => updateItem(i, "required_by", val)} className="h-8 text-[12px]" /></td>
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
const CONDITIONAL_QTYPES = ["BOOLEAN", "SINGLE_CHOICE", "MULTI_CHOICE"];
const BOOLEAN_ANSWERS = ["Yes", "No"];

function getAnswerOptions(parentQ: WizQuestion): string[] {
  if (parentQ.qtype === "BOOLEAN") return BOOLEAN_ANSWERS;
  if (parentQ.qtype === "SINGLE_CHOICE" || parentQ.qtype === "MULTI_CHOICE") return parentQ.options ?? [];
  return [];
}

function QuestionRow({
  q, si, qi, siblingQuestions, onUpdate, onDelete, defaultEditing = false, onEditOpened,
}: {
  q: WizQuestion;
  si: number;
  qi: number;
  siblingQuestions: WizQuestion[];
  onUpdate: (si: number, qi: number, field: keyof WizQuestion, val: unknown) => void;
  onDelete: (si: number, qi: number) => void;
  defaultEditing?: boolean;
  onEditOpened?: () => void;
}) {
  const [editing, setEditing] = useState(defaultEditing);

  // Notify parent once that this row has consumed the auto-open signal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (defaultEditing) onEditOpened?.(); }, []);

  const [draft, setDraft] = useState({
    text: q.text,
    qtype: q.qtype,
    mandatory: q.mandatory,
    scored: q.scored,
    weight: q.weight ?? 0,
    conditionalOn: q.conditionalOn ?? null as { questionId: number; answer: string } | null,
  });

  // Questions in same section that can be a parent (only BOOLEAN/SINGLE_CHOICE/MULTI_CHOICE, excluding self)
  const eligibleParents = siblingQuestions.filter(
    s => s.id !== q.id && CONDITIONAL_QTYPES.includes(s.qtype)
  );

  const selectedParent = eligibleParents.find(p => p.id === draft.conditionalOn?.questionId) ?? null;
  const answerOptions  = selectedParent ? getAnswerOptions(selectedParent) : [];

  function handleParentChange(parentId: string) {
    if (!parentId) {
      setDraft(d => ({ ...d, conditionalOn: null }));
    } else {
      setDraft(d => ({ ...d, conditionalOn: { questionId: Number(parentId), answer: "" } }));
    }
  }

  function commitEdit() {
    onUpdate(si, qi, "text", draft.text);
    onUpdate(si, qi, "qtype", draft.qtype);
    onUpdate(si, qi, "mandatory", draft.mandatory);
    onUpdate(si, qi, "scored", draft.scored);
    onUpdate(si, qi, "weight", draft.weight);
    onUpdate(si, qi, "conditionalOn", draft.conditionalOn ?? undefined);
    setEditing(false);
  }

  function discardEdit() {
    setDraft({ text: q.text, qtype: q.qtype, mandatory: q.mandatory, scored: q.scored, weight: q.weight ?? 0, conditionalOn: q.conditionalOn ?? null });
    setEditing(false);
  }

  const condParentLabel = q.conditionalOn
    ? siblingQuestions.find(s => s.id === q.conditionalOn!.questionId)?.text
    : null;

  if (editing) {
    return (
      <div className="px-4 py-4 bg-primary/3 border-b border-slate-100">
        <div className="grid grid-cols-1 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Question text</label>
            <Input
              value={draft.text}
              onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
              className="text-[13px]"
              placeholder="Enter question text…"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Response type</label>
              <select
                value={draft.qtype}
                onChange={e => setDraft(d => ({ ...d, qtype: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[13px] bg-white text-slate-700 focus:outline-none focus:border-slate-400"
              >
                {QTYPES.map(t => <option key={t} value={t}>{QTYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                <Checkbox checked={draft.mandatory} onCheckedChange={v => setDraft(d => ({ ...d, mandatory: !!v }))} />
                Required field
              </label>
              <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                <Checkbox checked={draft.scored} onCheckedChange={v => setDraft(d => ({ ...d, scored: !!v }))} />
                Include in technical score
              </label>
            </div>
          </div>
          {draft.scored && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Score weight (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number" min="0" max="100"
                  value={draft.weight}
                  onChange={e => setDraft(d => ({ ...d, weight: parseInt(e.target.value) || 0 }))}
                  className="w-24 text-[13px]"
                />
                <span className="text-[12px] text-slate-400">% of section score</span>
              </div>
            </div>
          )}

          {/* Conditional logic */}
          <div className="border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer mb-2">
              <Checkbox
                checked={!!draft.conditionalOn}
                onCheckedChange={v => setDraft(d => ({ ...d, conditionalOn: v ? { questionId: 0, answer: "" } : null }))}
              />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Show this question conditionally</span>
            </label>
            {draft.conditionalOn && (eligibleParents.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic ml-6">No eligible parent questions in this section. Add a Boolean or Choice question above first.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Show when question</label>
                  <select
                    value={draft.conditionalOn?.questionId ?? ""}
                    onChange={e => handleParentChange(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] bg-white text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    <option value="">— No condition —</option>
                    {eligibleParents.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.text ? (p.text.length > 40 ? p.text.slice(0, 40) + "…" : p.text) : `Question ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Answer is</label>
                  <select
                    disabled={!draft.conditionalOn?.questionId || answerOptions.length === 0}
                    value={draft.conditionalOn?.answer ?? ""}
                    onChange={e => setDraft(d => ({ ...d, conditionalOn: d.conditionalOn ? { ...d.conditionalOn, answer: e.target.value } : null }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] bg-white text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-40"
                  >
                    <option value="">— Select answer —</option>
                    {answerOptions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={commitEdit} className="flex items-center gap-1.5 text-[12px] font-semibold bg-primary text-white px-3.5 py-1.5 rounded-lg hover:bg-primary/80 transition-colors">
            <Check size={12} /> Save
          </button>
          <button onClick={discardEdit} className="text-[12px] text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50/60 transition-colors group", q.conditionalOn && "border-l-2 border-l-violet-300 bg-violet-50/30")}>
      <GripVertical size={13} className="text-slate-300 cursor-grab flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-slate-800 truncate">{q.text || <span className="text-slate-400 italic">No question text</span>}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{QTYPE_LABELS[q.qtype]}</span>
          {q.mandatory && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>}
          {q.scored && <span className="text-[10px] font-medium text-primary bg-primary/8 px-1.5 py-0.5 rounded">Scored · {q.weight ?? 0}%</span>}
          {q.conditionalOn && (
            <span className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
              If &quot;{condParentLabel ? (condParentLabel.length > 30 ? condParentLabel.slice(0, 30) + "…" : condParentLabel) : "?"}&quot; = {q.conditionalOn.answer}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-all"
          title="Edit question"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(si, qi)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
          title="Delete question"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function Step4({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [newQId, setNewQId] = useState<number | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const canAISuggest = !!wiz.category && !!AI_SUGGESTED_SECTIONS[wiz.category];

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
    const id = Date.now();
    setNewQId(id);
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: [...s.questions, { id, text: "", qtype: "TEXT", mandatory: false, scored: false, weight: 0 }] } : s) }));
  }
  function delQ(si: number, qi: number) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: s.questions.filter((_, j) => j !== qi) } : s) }));
  }
  function updateQ(si: number, qi: number, field: keyof WizQuestion, val: unknown) {
    setWiz(w => ({ ...w, sections: w.sections.map((s, i) => i === si ? { ...s, questions: s.questions.map((q, j) => j === qi ? { ...q, [field]: val } : q) } : s) }));
  }

  function handleAISuggest() {
    if (!wiz.category || !AI_SUGGESTED_SECTIONS[wiz.category]) return;
    setAiGenerating(true);
    setTimeout(() => {
      if (!mountedRef.current) return;
      const suggested = AI_SUGGESTED_SECTIONS[wiz.category];
      const newSections: WizSection[] = suggested.map((s, si) => ({
        id: Date.now() + si,
        title: s.title,
        type: s.type,
        mandatory: true,
        questions: s.questions.map((q, qi) => ({
          id: Date.now() + si * 100 + qi,
          text: q.text,
          qtype: q.qtype,
          mandatory: q.mandatory,
          scored: q.scored,
          weight: q.weight ?? 0,
        })),
      }));
      setWiz(w => ({ ...w, sections: newSections }));
      setAiGenerating(false);
      setAiDone(true);
    }, 1400);
  }

  return (
    <div>
      {/* RFP vs RFQ questionnaire purpose banner */}
      {wiz.type === "RFP" && (
        <div className="flex items-start gap-2 mb-4 p-3.5 bg-sky-50 border border-sky-200 rounded-xl">
          <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[9px] font-bold text-sky-700">i</span>
          </div>
          <p className="text-[12px] text-sky-800">
            <strong>RFP:</strong> Questions are <strong>scored</strong> and contribute to the weighted technical evaluation. Mark questions as "Scored" and assign weights. The combined tech + commercial score determines the award.
          </p>
        </div>
      )}
      {wiz.type === "RFQ" && (
        <div className="flex items-start gap-2 mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[9px] font-bold text-amber-700">i</span>
          </div>
          <p className="text-[12px] text-amber-800">
            <strong>RFQ:</strong> Questions are for <strong>qualification only</strong> — suppliers must pass before their price is considered. Award goes to the L1 (lowest price) among qualified suppliers. Scoring weights are not used.
          </p>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <StepHeader
          title="Questionnaire"
          sub={wiz.type === "RFP" ? "Scored questions determine technical evaluation weight." : wiz.type === "RFQ" ? "Qualification questions — pass/fail gates before price comparison." : "Questions sent to all invited suppliers."}
          inline
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <div title={!canAISuggest ? "Select a category in Basic details to enable AI suggestions" : ""}>
            <button
              onClick={handleAISuggest}
              disabled={!canAISuggest || aiGenerating}
              className="flex items-center gap-1.5 text-[12px] font-semibold border border-primary text-primary px-3.5 py-2 rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aiGenerating
                ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                : <><Sparkles size={13} /> AI suggest</>
              }
            </button>
          </div>
          <button onClick={addSection} className="flex items-center gap-1.5 text-[12px] font-semibold bg-primary text-white px-3.5 py-2 rounded-xl hover:bg-primary/80 transition-colors">
            <Plus size={13} /> Add section
          </button>
        </div>
      </div>

      {!canAISuggest && !wiz.category && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Sparkles size={13} className="text-slate-400 flex-shrink-0" />
          <p className="text-[12px] text-slate-500">
            Select a <strong>category</strong> in Basic details to enable AI-suggested questions.
          </p>
        </div>
      )}

      {aiDone && (
        <div className="flex items-center gap-2 mb-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
          <Sparkles size={14} className="text-primary flex-shrink-0" />
          <p className="text-[12px] text-primary font-medium">
            AI has suggested sections and questions for <strong>{wiz.category}</strong> — review and edit as needed.
          </p>
          <button onClick={() => setAiDone(false)} className="ml-auto text-primary/50 hover:text-primary transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {wiz.sections.length === 0 && (
        <Card><NotApplicable>No sections yet. Click "Add section" to build the questionnaire{canAISuggest ? " or use AI suggest" : ""}.</NotApplicable></Card>
      )}

      {wiz.sections.map((sec, si) => (
        <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl mb-3 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 flex-wrap">
            <Input
              defaultValue={sec.title}
              onBlur={e => updateSec(si, "title", e.target.value)}
              className="h-8 text-[13px] font-semibold w-48 flex-shrink-0"
              placeholder="Section title…"
            />
            <select
              value={sec.type}
              onChange={e => updateSec(si, "type", e.target.value)}
              className="h-8 px-2 border border-slate-200 rounded-lg text-[11px] bg-white text-slate-600 focus:outline-none focus:border-slate-400"
            >
              {SEC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
              <Checkbox checked={sec.mandatory} onCheckedChange={v => updateSec(si, "mandatory", !!v)} /> Required
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] text-slate-400">{sec.questions.length} question{sec.questions.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => addQ(si)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Plus size={11} /> Add question
              </button>
              <button
                onClick={() => delSection(si)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
                title="Remove section"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Questions */}
          <div>
            {sec.questions.length === 0 && (
              <p className="text-[12px] text-slate-400 px-4 py-4">No questions yet. Click "Add question" to begin.</p>
            )}
            {sec.questions.map((q, qi) => (
              <QuestionRow
                key={q.id}
                q={q} si={si} qi={qi}
                siblingQuestions={sec.questions}
                onUpdate={updateQ}
                onDelete={delQ}
                defaultEditing={q.id === newQId}
                onEditOpened={() => setNewQId(null)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Step Evaluators (RFP specific)
════════════════════════════════════════════════════════════════════ */
function StepEvaluators({ wiz, setWiz }: { wiz: WizState; setWiz: React.Dispatch<React.SetStateAction<WizState>> }) {
  function addEvaluator() {
    setWiz(w => ({
      ...w,
      evaluators: [...w.evaluators, { id: Date.now(), name: "", email: "", canView: true, canEdit: false, canEvaluate: false, sections: [] }]
    }));
  }
  function removeEvaluator(idx: number) {
    setWiz(w => ({ ...w, evaluators: w.evaluators.filter((_, i) => i !== idx) }));
  }
  function updateEvaluator(idx: number, field: keyof WizEvaluator, val: unknown) {
    setWiz(w => ({
      ...w,
      evaluators: w.evaluators.map((ev, i) => i === idx ? { ...ev, [field]: val } : ev)
    }));
  }
  function toggleSection(idx: number, secId: number) {
    setWiz(w => ({
      ...w,
      evaluators: w.evaluators.map((ev, i) => {
        if (i !== idx) return ev;
        const newSecs = ev.sections.includes(secId) ? ev.sections.filter(id => id !== secId) : [...ev.sections, secId];
        return { ...ev, sections: newSecs };
      })
    }));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <StepHeader title="Stakeholders" sub="Assign internal stakeholders and specify their access permissions." inline />
      </div>
      
      <div className="space-y-4 mb-4">
        {wiz.evaluators.length === 0 && (
          <Card><NotApplicable>No stakeholders added yet.</NotApplicable></Card>
        )}
        {wiz.evaluators.map((ev, i) => (
          <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-5 relative shadow-sm">
            <button onClick={() => removeEvaluator(i)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all">
              <Trash2 size={14} />
            </button>
            <div className="mb-5 pr-10">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Name</label>
              <select
                value={ev.name}
                onChange={e => updateEvaluator(i, "name", e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[13px] bg-white text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="">Select team member…</option>
                <option value="Priya Sharma">Priya Sharma</option>
                <option value="Rahul Verma">Rahul Verma</option>
                <option value="Sam Rayburn">Sam Rayburn</option>
                <option value="Amit Patel">Amit Patel</option>
                <option value="Neha Gupta">Neha Gupta</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-1 flex-shrink-0 relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 bg-white group-hover:border-primary transition-colors">
                  {!ev.canEdit && !ev.canEvaluate && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                {/* We use an invisible native radio just for accessibility/semantics, but custom visual above */}
                <input type="radio" checked={!ev.canEdit && !ev.canEvaluate} onChange={() => { updateEvaluator(i, "canEdit", false); updateEvaluator(i, "canEvaluate", false); }} className="sr-only" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Can view</div>
                  <div className="text-[12px] text-slate-500">Users can view the whole event.</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-1 flex-shrink-0 relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 bg-white group-hover:border-primary transition-colors">
                  {ev.canEdit && !ev.canEvaluate && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <input type="radio" checked={ev.canEdit && !ev.canEvaluate} onChange={() => { updateEvaluator(i, "canEdit", true); updateEvaluator(i, "canEvaluate", false); }} className="sr-only" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Can edit</div>
                  <div className="text-[12px] text-slate-500">Users can edit the event and view only: Header, Appendix documents, and the Supplier list.</div>
                </div>
              </label>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-0.5"><Checkbox checked={ev.canEvaluate} onCheckedChange={v => updateEvaluator(i, "canEvaluate", !!v)} /></div>
                  <div>
                    <div className="text-[13px] font-medium text-slate-800">Can evaluate</div>
                    <div className="text-[12px] text-slate-500">Users can view and evaluate the assigned sections. Unless given additional permissions above.</div>
                  </div>
                </label>
                
                {ev.canEvaluate && (
                  <div className="mt-3 ml-7 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wide">Assign sections</div>
                    {wiz.sections.length === 0 ? (
                      <div className="text-[12px] text-slate-400">No sections defined yet. Go to Step 4 to build your questionnaire.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {wiz.sections.map(sec => (
                          <label key={sec.id} className="flex items-center gap-2.5 text-[13px] text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                            <Checkbox checked={ev.sections.includes(sec.id)} onCheckedChange={() => toggleSection(i, sec.id)} />
                            <span className="font-medium">{sec.title || "Untitled section"}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mb-4">
        <button onClick={addEvaluator} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 transition-colors px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          <Plus size={14} /> Add stakeholder
        </button>
      </div>

      <InfoBox variant="blue">
        Stakeholders will receive an email invitation to access the scoring panel once the event moves to the "Under Evaluation" stage.
      </InfoBox>
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

  const INVITED_STYLE = "bg-indigo-50 text-indigo-600";

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
        <StepHeader title="Suppliers" sub="Invite suppliers — they'll be notified when the event is published." inline />
        <button onClick={() => setWiz(w => ({ ...w, _inviteOpen: true, _inviteSearch: "", _inviteSelected: [] }))} className="flex items-center gap-1.5 text-[12px] font-semibold bg-primary text-white px-3.5 py-2 rounded-xl hover:bg-primary/80 transition-colors flex-shrink-0">
          <Plus size={13} /> Invite suppliers
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[{ v: wiz.participants.length, l: "Total invited" }, { v: wiz.participants.length, l: "Pending (notified on publish)" }].map(({ v, l }) => (
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
                      <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all", checked ? "bg-primary border-primary" : "bg-white border-slate-300")}>
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
              <button onClick={confirmInvite} className="text-[12px] font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/80 transition-colors">
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
                      <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg", INVITED_STYLE)}>INVITED</span>
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
  const [openId, setOpenId] = useState<number | null>(null);

  const RECIPIENTS = [
    { key: "EVENT_MANAGER", label: "Event Manager" },
    { key: "STAKEHOLDER",   label: "Stakeholder" },
    { key: "SUPPLIER",      label: "Supplier" },
  ];

  const BLANK_REMINDER = (): WizReminder => ({
    id: Date.now(),
    headline: "",
    scheduled: "2026-09-25T09:00",
    recipients: [],
    sent: false,
    excl_sub: false,
    excl_finalised: false,
    include_link: true,
    repeat_enabled: false,
    repeat_days: "",
    repeat_hours: "",
    stop_after: "after",
    stop_repetitions: "1",
    subject: "",
    body: "",
  });

  function addReminder() {
    const r = BLANK_REMINDER();
    setWiz(w => ({ ...w, reminders: [...w.reminders, r] }));
    setOpenId(r.id);
  }

  function updateField<K extends keyof WizReminder>(id: number, field: K, val: WizReminder[K]) {
    setWiz(w => ({ ...w, reminders: w.reminders.map(r => r.id !== id ? r : { ...r, [field]: val }) }));
  }

  function toggleRecipient(id: number, key: string) {
    setWiz(w => ({
      ...w,
      reminders: w.reminders.map(r => r.id !== id ? r : {
        ...r,
        recipients: r.recipients.includes(key) ? r.recipients.filter(x => x !== key) : [...r.recipients, key],
      }),
    }));
  }

  function deleteReminder(id: number) {
    setWiz(w => ({ ...w, reminders: w.reminders.filter(r => r.id !== id) }));
    if (openId === id) setOpenId(null);
  }

  const openReminder = wiz.reminders.find(r => r.id === openId) ?? null;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <StepHeader title="Reminders" sub="Schedule email notifications for this event." inline />
        <button onClick={addReminder} className="flex items-center gap-1.5 text-[12px] font-semibold bg-primary text-white px-3.5 py-2 rounded-xl hover:bg-primary/80 transition-colors flex-shrink-0">
          <Plus size={13} /> Add reminder
        </button>
      </div>
      <div className="mb-4">
        <InfoBox variant="blue">System notifications (event cancelled, supplier awarded, etc.) always send regardless of these settings.</InfoBox>
      </div>

      {wiz.reminders.length === 0 && <Card><NotApplicable>No reminders yet. Click "Add reminder" to schedule one.</NotApplicable></Card>}

      {/* Reminder list */}
      <div className="space-y-2 mb-4">
        {wiz.reminders.map(r => (
          <div
            key={r.id}
            className={cn(
              "bg-white border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:border-slate-300",
              openId === r.id ? "border-primary ring-1 ring-primary/20" : "border-slate-200"
            )}
            onClick={() => setOpenId(openId === r.id ? null : r.id)}
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">
                {r.headline || <span className="text-slate-400 font-normal italic">Untitled reminder</span>}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{r.scheduled ? r.scheduled.replace("T", " · ") : "No date set"}</span>
                {r.recipients.length > 0 && (
                  <span className="text-slate-300">·</span>
                )}
                {r.recipients.length > 0 && (
                  <span>{r.recipients.map(rc => RECIPIENTS.find(x => x.key === rc)?.label ?? rc).join(", ")}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-lg tracking-wide", r.sent ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                {r.sent ? "Sent" : "Scheduled"}
              </span>
              <button
                onClick={e => { e.stopPropagation(); deleteReminder(r.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reminder setup form */}
      {openReminder && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-[14px] font-bold text-slate-900 mb-5">Reminder setup</div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={openReminder.headline}
              onChange={e => updateField(openReminder.id, "headline", e.target.value)}
              placeholder="Reminder title"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white"
            />
          </div>

          {/* Date / time */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Send on
            </label>
            <DateTimePicker
              value={openReminder.scheduled}
              onChange={val => updateField(openReminder.id, "scheduled", val)}
              className="h-9"
            />
          </div>

          {/* Repeat */}
          <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={openReminder.repeat_enabled}
                onChange={e => updateField(openReminder.id, "repeat_enabled", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-primary"
              />
              <span className="text-[13px] font-medium text-slate-700">Repeat after</span>
              <input
                type="number"
                min={0}
                value={openReminder.repeat_days}
                onChange={e => updateField(openReminder.id, "repeat_days", e.target.value)}
                disabled={!openReminder.repeat_enabled}
                placeholder="0"
                className="w-14 h-8 px-2 border border-slate-200 rounded-lg text-[12px] text-center bg-white disabled:opacity-40 focus:outline-none focus:border-primary"
              />
              <span className="text-[12px] text-slate-500">days</span>
              <input
                type="number"
                min={0}
                max={23}
                value={openReminder.repeat_hours}
                onChange={e => updateField(openReminder.id, "repeat_hours", e.target.value)}
                disabled={!openReminder.repeat_enabled}
                placeholder="0"
                className="w-14 h-8 px-2 border border-slate-200 rounded-lg text-[12px] text-center bg-white disabled:opacity-40 focus:outline-none focus:border-primary"
              />
              <span className="text-[12px] text-slate-500">hours</span>
            </label>
            {openReminder.repeat_enabled && (
              <div className="flex items-center gap-2 ml-6">
                <span className="text-[12px] text-slate-500">Stop repeating:</span>
                <select
                  value={openReminder.stop_after}
                  onChange={e => updateField(openReminder.id, "stop_after", e.target.value)}
                  className="h-8 px-2 border border-slate-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-primary"
                >
                  <option value="after">after</option>
                  <option value="never">never</option>
                  <option value="on_date">on date</option>
                </select>
                {openReminder.stop_after === "after" && (
                  <>
                    <input
                      type="number"
                      min={1}
                      value={openReminder.stop_repetitions}
                      onChange={e => updateField(openReminder.id, "stop_repetitions", e.target.value)}
                      className="w-14 h-8 px-2 border border-slate-200 rounded-lg text-[12px] text-center bg-white focus:outline-none focus:border-primary"
                    />
                    <span className="text-[12px] text-slate-500">repetitions</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Email content */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Email subject <span className="text-red-400">*</span>
            </label>
            <input
              value={openReminder.subject}
              onChange={e => updateField(openReminder.id, "subject", e.target.value)}
              placeholder="Subject"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white"
            />
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Email body <span className="text-red-400">*</span>
            </label>
            <textarea
              value={openReminder.body}
              onChange={e => updateField(openReminder.id, "body", e.target.value)}
              placeholder="Email text"
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white resize-y min-h-[96px]"
            />
          </div>

          {/* Recipients */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Recipients <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {RECIPIENTS.map(rc => (
                <label key={rc.key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={openReminder.recipients.includes(rc.key)}
                    onChange={() => toggleRecipient(openReminder.id, rc.key)}
                    className="w-4 h-4 rounded border-slate-300 accent-primary"
                  />
                  <span className="text-[13px] text-slate-700">{rc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="mb-5 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openReminder.excl_finalised}
                onChange={e => updateField(openReminder.id, "excl_finalised", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-primary"
              />
              <span className="text-[13px] text-slate-700">Exclude suppliers who finalised</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openReminder.include_link}
                onChange={e => updateField(openReminder.id, "include_link", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-primary"
              />
              <span className="text-[13px] text-slate-700">Include access link in email</span>
            </label>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setOpenId(null)}
              className="flex items-center gap-1.5 text-[13px] font-semibold bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary/80 transition-colors"
            >
              <CheckCircle2 size={14} /> Save
            </button>
          </div>
        </div>
      )}
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

  const scoredQ = wiz.sections.reduce((n, s) => n + s.questions.filter(q => q.scored).length, 0);
  const totalWeight = wiz.sections.reduce((n, s) => n + s.questions.filter(q => q.scored).reduce((w, q) => w + (q.weight ?? 0), 0), 0);

  const checks = [
    { ok: true,                         label: "Event title provided" },
    { ok: !!wiz.deadline,               label: wiz.deadline ? "Submission deadline set" : "Submission deadline not set" },
    {
      ok: wiz.type === "RFI" || wiz.type === "RFP" || wiz.items.length > 0,
      label: wiz.type === "RFI" ? "Bid Matrix not required for RFI"
           : wiz.type === "RFP" ? wiz.items.length > 0 ? `${wiz.items.length} bid matrix items added` : "Bid Matrix optional for RFP — none added"
           : wiz.items.length > 0 ? `${wiz.items.length} bid matrix items added` : "Bid Matrix is mandatory for RFQ — no items added",
    },
    {
      ok: wiz.type !== "RFP" || scoredQ > 0,
      label: wiz.type === "RFP"
        ? scoredQ > 0 ? `${scoredQ} scored questions (total weight: ${totalWeight}%)` : "RFP requires at least one scored evaluation question"
        : `${totalQ} qualification questions in ${wiz.sections.length} sections`,
    },
    { ok: wiz.participants.length > 0,  label: wiz.participants.length > 0 ? `${wiz.participants.length} suppliers invited` : "No suppliers invited yet" },
    { ok: totalQ > 0,                   label: totalQ > 0 ? `${totalQ} total questions` : "No questionnaire sections added" },
    { ok: wiz.evaluators.length > 0, label: wiz.evaluators.length > 0 ? `${wiz.evaluators.length} stakeholder(s) assigned` : "No stakeholders assigned yet" },
    { ok: wiz.reminders.length > 0,     label: `${wiz.reminders.length} reminder(s) scheduled` },
  ];
  const allOk = checks.every(c => c.ok);

  const rows = [
    { label: "Type",          value: <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-lg", meta.accent.pill)}>{meta.short}</span> },
    { label: "Format",        value: fmtLabel },
    { label: "Event name",    value: "Annual Decorative Lighting Contract" },
    { label: "Deadline",      value: wiz.deadline ? new Date(wiz.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
    ...(cfg.showPricing ? [{ label: "Est. value", value: "₹50,00,000" }] : []),
    ...(cfg.showPricing ? [{ label: "Bid validity", value: wiz.bidValidityDays ? `${wiz.bidValidityDays} days` : "—" }] : []),
    { label: "Bid Matrix items",
      value: cfg.showItems ? `${wiz.items.length} items${total > 0 ? ` / ₹${total.toLocaleString("en-IN")}` : ""}` : "N/A" },
    ...(wiz.type === "RFP" ? [{ label: "Award basis", value: "Weighted technical + commercial score" }] : []),
    ...(wiz.type === "RFQ" ? [{ label: "Award basis", value: "L1 — lowest qualified bid" }] : []),
    { label: "Suppliers",     value: `${wiz.participants.length} invited` },
    { label: "Questionnaire", value: `${totalQ} questions, ${wiz.sections.length} sections` },
    ...(wiz.type === "RFP" ? [{ label: "Scored questions", value: `${scoredQ} (${totalWeight}% total weight)` }] : []),
    { label: "Stakeholders", value: `${wiz.evaluators.length} assigned` },
    { label: "Two-envelope",  value: wiz.toggles.two_envelope_system ? "Yes" : "No" },
    { label: "Reminders",     value: `${wiz.reminders.length} scheduled` },
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
