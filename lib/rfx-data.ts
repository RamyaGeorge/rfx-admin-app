import type {
  RFXEvent,
  ActiveEvent,
  SupplierResponse,
  Clarification,
  EvalCriterion,
  WizState,
  WizSection,
  WizItem,
} from "./rfx-types";

export const EVENTS_LIST: RFXEvent[] = [
  {
    id: 1,
    number: "RFQ-2025-0018",
    type: "RFQ",
    title: "Annual Decorative Lighting Contract - Phase 2",
    status: "UNDER_EVALUATION",
    deadline: "30 Sep 2025",
    responses: 5,
    qualified: 3,
  },
  {
    id: 2,
    number: "RFP-2025-0017",
    type: "RFP",
    title: "Office Furniture Procurement – HQ",
    status: "OPEN",
    deadline: "20 Oct 2025",
    responses: 2,
    qualified: 2,
  },
  {
    id: 3,
    number: "RFI-2025-0016",
    type: "RFI",
    title: "Market Survey: EV Charging Infrastructure",
    status: "PUBLISHED",
    deadline: "15 Oct 2025",
    responses: 0,
    qualified: 0,
  },
  {
    id: 4,
    number: "RFQ-DRAFT-001",
    type: "RFQ",
    title: "IT Hardware & Peripherals Refresh 2026",
    status: "DRAFT",
    deadline: "—",
    responses: 0,
    qualified: 0,
  },
  {
    id: 5,
    number: "RFQ-DRAFT-002",
    type: "RFQ",
    title: "Campus Security Infrastructure Upgrade",
    status: "DRAFT",
    deadline: "—",
    responses: 0,
    qualified: 0,
  },
];

export const ACTIVE_EVENT: ActiveEvent = {
  id: 1,
  number: "RFQ-2025-0018",
  type: "RFQ",
  title: "Annual Decorative Lighting Contract - Phase 2",
  status: "UNDER_EVALUATION",
  deadline: "30 Sep 2025",
  two_envelope: true,
  tech_opening: "05 Oct 2025",
  fin_opening: "15 Oct 2025",
  tech_phase: "OPENED",
  fin_phase: "SEALED",
  min_qual_score: 70,
};

export const RESPONSES_BY_EVENT: Record<number, SupplierResponse[]> = {
  // Event 1 — RFQ-2025-0018 (UNDER_EVALUATION) — defined below as RESPONSES
  1: [],
  // Event 2 — RFP-2025-0017 (OPEN)
  2: [
    {
      id: 101,
      supplier: "FurniWorld Pvt Ltd",
      country: "IN",
      submitted: "18 Oct 2025, 10:30",
      status: "SUBMITTED",
      tech_env: "OPENED",
      fin_env: "SEALED",
      tech_score: 88.0,
      fin_env_amount: null,
      rank: null,
      is_l1: false,
      is_disqualified: false,
      items: [
        { code: "FRN-001", desc: "Executive Office Chair", qty: 50, unit: "PCS", unit_price: null, total: null },
        { code: "FRN-002", desc: "Standing Desk 160x80cm", qty: 30, unit: "PCS", unit_price: null, total: null },
      ],
      answers: [
        { section: "Company Profile", q: "Years in business", type: "NUMERIC", val: "15", score: null },
        { section: "Technical", q: "ISO 9001 Certified?", type: "BOOLEAN", val: "Yes", score: 100 },
        { section: "Technical", q: "Delivery lead time (weeks)", type: "NUMERIC", val: "6", score: 85 },
      ],
    },
    {
      id: 102,
      supplier: "OfficeZone Solutions",
      country: "IN",
      submitted: "19 Oct 2025, 15:00",
      status: "SUBMITTED",
      tech_env: "OPENED",
      fin_env: "SEALED",
      tech_score: 74.5,
      fin_env_amount: null,
      rank: null,
      is_l1: false,
      is_disqualified: false,
      items: [
        { code: "FRN-001", desc: "Executive Office Chair", qty: 50, unit: "PCS", unit_price: null, total: null },
      ],
      answers: [
        { section: "Company Profile", q: "Years in business", type: "NUMERIC", val: "8", score: null },
        { section: "Technical", q: "ISO 9001 Certified?", type: "BOOLEAN", val: "No", score: 0 },
        { section: "Technical", q: "Delivery lead time (weeks)", type: "NUMERIC", val: "10", score: 70 },
      ],
    },
  ],
  // Event 3 — RFI-2025-0016 (PUBLISHED) — market survey responses
  3: [
    {
      id: 301,
      supplier: "Tata Power EV Ltd",
      country: "IN",
      submitted: "10 Oct 2025, 09:15",
      status: "SUBMITTED",
      tech_env: "OPENED",
      fin_env: "SEALED",
      tech_score: null,
      fin_env_amount: null,
      rank: null,
      is_l1: false,
      is_disqualified: false,
      items: [],
      answers: [
        { section: "Market Information", q: "Current EV charger deployment capacity (units/month)", type: "NUMERIC", val: "500", score: null },
        { section: "Market Information", q: "Do you offer turnkey installation services?", type: "BOOLEAN", val: "Yes", score: null },
        { section: "Market Information", q: "Supported charging standards", type: "SINGLE_CHOICE", val: "CCS2, CHAdeMO, Type 2", score: null },
        { section: "Company Profile", q: "Years in EV infrastructure", type: "NUMERIC", val: "6", score: null },
      ],
    },
    {
      id: 302,
      supplier: "Greaves ElectrX",
      country: "IN",
      submitted: "11 Oct 2025, 14:30",
      status: "SUBMITTED",
      tech_env: "OPENED",
      fin_env: "SEALED",
      tech_score: null,
      fin_env_amount: null,
      rank: null,
      is_l1: false,
      is_disqualified: false,
      items: [],
      answers: [
        { section: "Market Information", q: "Current EV charger deployment capacity (units/month)", type: "NUMERIC", val: "300", score: null },
        { section: "Market Information", q: "Do you offer turnkey installation services?", type: "BOOLEAN", val: "No", score: null },
        { section: "Market Information", q: "Supported charging standards", type: "SINGLE_CHOICE", val: "Type 2 only", score: null },
        { section: "Company Profile", q: "Years in EV infrastructure", type: "NUMERIC", val: "3", score: null },
      ],
    },
    {
      id: 303,
      supplier: "Charge+Zone Network",
      country: "IN",
      submitted: "13 Oct 2025, 11:00",
      status: "SUBMITTED",
      tech_env: "OPENED",
      fin_env: "SEALED",
      tech_score: null,
      fin_env_amount: null,
      rank: null,
      is_l1: false,
      is_disqualified: false,
      items: [],
      answers: [
        { section: "Market Information", q: "Current EV charger deployment capacity (units/month)", type: "NUMERIC", val: "1200", score: null },
        { section: "Market Information", q: "Do you offer turnkey installation services?", type: "BOOLEAN", val: "Yes", score: null },
        { section: "Market Information", q: "Supported charging standards", type: "SINGLE_CHOICE", val: "CCS2, Type 2, AC Slow", score: null },
        { section: "Company Profile", q: "Years in EV infrastructure", type: "NUMERIC", val: "9", score: null },
      ],
    },
  ],
  // Event 4 — DRAFT — no responses
  4: [],
  // Event 5 — DRAFT — no responses
  5: [],
};

export const CLARIFICATIONS_BY_EVENT: Record<number, Clarification[]> = {
  1: [], // filled below from CLARIFICATIONS
  2: [
    {
      id: 201,
      q: "Can we supply ergonomic chairs as a substitute for executive chairs?",
      a: "Yes, ergonomic alternatives are acceptable if they meet the specifications in Annex B.",
      asked: "10 Oct 2025",
      answered: "11 Oct 2025",
      supplier: "FurniWorld Pvt Ltd",
      anon: false,
      published: true,
      status: "ANSWERED",
    },
    {
      id: 202,
      q: "Is installation included in the scope?",
      a: null,
      asked: "12 Oct 2025",
      answered: null,
      supplier: "OfficeZone Solutions",
      anon: false,
      published: false,
      status: "PENDING",
    },
  ],
  3: [
    {
      id: 301,
      q: "Is a formal letter of intent required to participate in this RFI?",
      a: "No formal letter required. Simply submit your responses via the portal.",
      asked: "05 Oct 2025",
      answered: "06 Oct 2025",
      supplier: "Tata Power EV Ltd",
      anon: false,
      published: true,
      status: "ANSWERED",
    },
    {
      id: 302,
      q: "Will the information submitted be kept confidential?",
      a: null,
      asked: "08 Oct 2025",
      answered: null,
      supplier: "Greaves ElectrX",
      anon: true,
      published: false,
      status: "PENDING",
    },
  ],
  4: [],
  5: [],
};

export const RESPONSES: SupplierResponse[] = [
  {
    id: 1,
    supplier: "ABC Lighting Co.",
    country: "IN",
    submitted: "28 Sep 2025, 18:45",
    status: "SUBMITTED",
    tech_env: "OPENED",
    fin_env: "SEALED",
    tech_score: 84.5,
    fin_env_amount: null,
    rank: null,
    is_l1: false,
    is_disqualified: false,
    items: [
      { code: "LT-BRASS-001", desc: "Custom Brass Wall Sconce", qty: 500, unit: "PCS", unit_price: null, total: null },
      { code: "LT-LED-002", desc: "LED Retrofit Bulb 10W E27", qty: 2000, unit: "PCS", unit_price: null, total: null },
    ],
    answers: [
      { section: "Technical Compliance", q: "Do all luminaires meet IP44 or higher ingress protection rating?", type: "BOOLEAN", val: "Yes — IP65 rated across full range", score: 95 },
      { section: "Technical Compliance", q: "Warranty period offered on luminaires (months)", type: "NUMERIC", val: "24 months (extendable to 36 on request)", score: 90 },
      { section: "Technical Compliance", q: "Primary manufacturing facility location", type: "SINGLE_CHOICE", val: "India – Pune (ISO-certified plant)", score: 88 },
      { section: "Technical Compliance", q: "Upload BIS / IS 9900:2002 Material Certification", type: "FILE_UPLOAD", val: "BIS_Cert_ABC_IS9900.pdf", score: null },
      { section: "Quality & Compliance", q: "Is your organisation ISO 9001:2015 certified? Upload certificate.", type: "FILE_UPLOAD", val: "ISO9001_ABC_2025.pdf", score: 100 },
      { section: "Quality & Compliance", q: "Annual financial turnover for last 3 years (₹ Cr)", type: "NUMERIC", val: "FY23: ₹4.2 Cr | FY24: ₹5.1 Cr | FY25: ₹6.3 Cr", score: null },
      { section: "Quality & Compliance", q: "Provide at least 2 references for similar projects (value ≥ ₹50L) executed in last 5 years", type: "FILE_UPLOAD", val: "Project_References_ABC.pdf", score: 90 },
      { section: "Company Profile", q: "Number of years in the decorative and industrial lighting business", type: "NUMERIC", val: "18 years", score: 92 },
      { section: "Company Profile", q: "Describe your after-sales service network in India (locations, response SLA)", type: "TEXT", val: "12 service centres across India; 48-hour on-site response SLA; dedicated account manager assigned.", score: 88 },
      { section: "Company Profile", q: "Estimated delivery lead time from purchase order (weeks)", type: "NUMERIC", val: "6 weeks for standard items; 8 weeks for custom brass finish", score: 85 },
    ],
  },
  {
    id: 2,
    supplier: "GlobeLux Industries",
    country: "DE",
    submitted: "29 Sep 2025, 11:20",
    status: "SUBMITTED",
    tech_env: "OPENED",
    fin_env: "SEALED",
    tech_score: 78.2,
    fin_env_amount: null,
    rank: null,
    is_l1: false,
    is_disqualified: false,
    items: [
      { code: "LT-BRASS-001", desc: "Custom Brass Wall Sconce", qty: 500, unit: "PCS", unit_price: null, total: null },
      { code: "LT-LED-002", desc: "LED Retrofit Bulb 10W E27", qty: 2000, unit: "PCS", unit_price: null, total: null },
    ],
    answers: [
      { section: "Technical Compliance", q: "Do all luminaires meet IP44 or higher ingress protection rating?", type: "BOOLEAN", val: "Yes — IP44 rated (standard EU directive)", score: 80 },
      { section: "Technical Compliance", q: "Warranty period offered on luminaires (months)", type: "NUMERIC", val: "18 months", score: 75 },
      { section: "Technical Compliance", q: "Primary manufacturing facility location", type: "SINGLE_CHOICE", val: "Germany – Hamburg (DIN EN ISO plant)", score: 70 },
      { section: "Technical Compliance", q: "Upload BIS / IS 9900:2002 Material Certification", type: "FILE_UPLOAD", val: "GlobeLux_CE_Equiv_Cert.pdf", score: null },
      { section: "Quality & Compliance", q: "Is your organisation ISO 9001:2015 certified? Upload certificate.", type: "FILE_UPLOAD", val: "ISO9001_GlobeLux_2024.pdf", score: 100 },
      { section: "Quality & Compliance", q: "Annual financial turnover for last 3 years (₹ Cr)", type: "NUMERIC", val: "FY23: €3.8M | FY24: €4.5M | FY25: €5.2M", score: null },
      { section: "Quality & Compliance", q: "Provide at least 2 references for similar projects (value ≥ ₹50L) executed in last 5 years", type: "FILE_UPLOAD", val: "GlobeLux_References_EU_IN.pdf", score: 75 },
      { section: "Company Profile", q: "Number of years in the decorative and industrial lighting business", type: "NUMERIC", val: "12 years", score: 78 },
      { section: "Company Profile", q: "Describe your after-sales service network in India (locations, response SLA)", type: "TEXT", val: "Authorised service partner in Mumbai and Delhi; 72-hour response SLA; spare parts stocked locally.", score: 72 },
      { section: "Company Profile", q: "Estimated delivery lead time from purchase order (weeks)", type: "NUMERIC", val: "10 weeks (ocean freight from EU)", score: 65 },
    ],
  },
  {
    id: 3,
    supplier: "Nova Electricals Pvt Ltd",
    country: "IN",
    submitted: "30 Sep 2025, 22:55",
    status: "SUBMITTED",
    tech_env: "OPENED",
    fin_env: "SEALED",
    tech_score: 65.0,
    fin_env_amount: null,
    rank: null,
    is_l1: false,
    is_disqualified: true,
    disqualify_reason: "Technical score below minimum qualification threshold of 70.",
    items: [
      { code: "LT-BRASS-001", desc: "Custom Brass Wall Sconce", qty: 500, unit: "PCS", unit_price: null, total: null },
    ],
    answers: [
      { section: "Technical Compliance", q: "Do all luminaires meet IP44 or higher ingress protection rating?", type: "BOOLEAN", val: "IP44 for outdoor; indoor models are IP20 only", score: 55 },
      { section: "Technical Compliance", q: "Warranty period offered on luminaires (months)", type: "NUMERIC", val: "12 months", score: 50 },
      { section: "Technical Compliance", q: "Primary manufacturing facility location", type: "SINGLE_CHOICE", val: "India – Faridabad (non-certified facility)", score: 60 },
      { section: "Technical Compliance", q: "Upload BIS / IS 9900:2002 Material Certification", type: "FILE_UPLOAD", val: null, score: null },
      { section: "Quality & Compliance", q: "Is your organisation ISO 9001:2015 certified? Upload certificate.", type: "BOOLEAN", val: "No — certification in progress, expected Jan 2026", score: 0 },
      { section: "Quality & Compliance", q: "Annual financial turnover for last 3 years (₹ Cr)", type: "NUMERIC", val: "FY23: ₹1.1 Cr | FY24: ₹1.4 Cr | FY25: ₹1.8 Cr", score: null },
      { section: "Quality & Compliance", q: "Provide at least 2 references for similar projects (value ≥ ₹50L) executed in last 5 years", type: "FILE_UPLOAD", val: null, score: 40 },
      { section: "Company Profile", q: "Number of years in the decorative and industrial lighting business", type: "NUMERIC", val: "4 years", score: 45 },
      { section: "Company Profile", q: "Describe your after-sales service network in India (locations, response SLA)", type: "TEXT", val: "Single service centre in Delhi NCR; best-effort response, no formal SLA.", score: 50 },
      { section: "Company Profile", q: "Estimated delivery lead time from purchase order (weeks)", type: "NUMERIC", val: "12–14 weeks", score: 55 },
    ],
  },
  {
    id: 4,
    supplier: "LightWave Solutions",
    country: "SG",
    submitted: "—",
    status: "WITHDRAWN",
    tech_env: "SEALED",
    fin_env: "SEALED",
    tech_score: null,
    fin_env_amount: null,
    rank: null,
    is_l1: false,
    is_disqualified: false,
    items: [],
    answers: [],
  },
  {
    id: 5,
    supplier: "BrightPath GmbH",
    country: "DE",
    submitted: "30 Sep 2025, 09:10",
    status: "SUBMITTED",
    tech_env: "OPENED",
    fin_env: "SEALED",
    tech_score: 81.0,
    fin_env_amount: null,
    rank: null,
    is_l1: false,
    is_disqualified: false,
    items: [
      { code: "LT-BRASS-001", desc: "Custom Brass Wall Sconce", qty: 500, unit: "PCS", unit_price: null, total: null },
      { code: "LT-LED-002", desc: "LED Retrofit Bulb 10W E27", qty: 2000, unit: "PCS", unit_price: null, total: null },
    ],
    answers: [
      { section: "Technical Compliance", q: "Do all luminaires meet IP44 or higher ingress protection rating?", type: "BOOLEAN", val: "Yes — IP54 certified (TÜV Rheinland verified)", score: 92 },
      { section: "Technical Compliance", q: "Warranty period offered on luminaires (months)", type: "NUMERIC", val: "24 months", score: 88 },
      { section: "Technical Compliance", q: "Primary manufacturing facility location", type: "SINGLE_CHOICE", val: "Germany – Munich (ISO 14001 & 9001 plant)", score: 75 },
      { section: "Technical Compliance", q: "Upload BIS / IS 9900:2002 Material Certification", type: "FILE_UPLOAD", val: "BrightPath_TUV_Material_Cert.pdf", score: null },
      { section: "Quality & Compliance", q: "Is your organisation ISO 9001:2015 certified? Upload certificate.", type: "FILE_UPLOAD", val: "ISO9001_BrightPath_2025.pdf", score: 100 },
      { section: "Quality & Compliance", q: "Annual financial turnover for last 3 years (₹ Cr)", type: "NUMERIC", val: "FY23: €5.1M | FY24: €6.4M | FY25: €7.2M", score: null },
      { section: "Quality & Compliance", q: "Provide at least 2 references for similar projects (value ≥ ₹50L) executed in last 5 years", type: "FILE_UPLOAD", val: "BrightPath_ProjectRefs.pdf", score: 85 },
      { section: "Company Profile", q: "Number of years in the decorative and industrial lighting business", type: "NUMERIC", val: "22 years", score: 95 },
      { section: "Company Profile", q: "Describe your after-sales service network in India (locations, response SLA)", type: "TEXT", val: "Partnership with 3 certified Indian service providers (Mumbai, Bangalore, Chennai); 24-hour escalation SLA.", score: 82 },
      { section: "Company Profile", q: "Estimated delivery lead time from purchase order (weeks)", type: "NUMERIC", val: "8 weeks via air freight; 12 weeks ocean freight", score: 72 },
    ],
  },
];

export const CRITERIA: EvalCriterion[] = [
  // Technical Compliance section
  { name: "Product IP Rating Compliance",       type: "TECHNICAL",   section: "Technical Compliance", weight: 15, max: 100, is_pf: false },
  { name: "Warranty Period Offered",            type: "TECHNICAL",   section: "Technical Compliance", weight: 15, max: 100, is_pf: false },
  { name: "Manufacturing Facility Location",    type: "TECHNICAL",   section: "Technical Compliance", weight: 10, max: 100, is_pf: false },
  { name: "BIS / Material Certification",       type: "COMPLIANCE",  section: "Technical Compliance", weight: 0,  max: 0,   is_pf: true  },
  // Quality & Compliance section
  { name: "ISO 9001:2015 Certification",        type: "COMPLIANCE",  section: "Quality & Compliance", weight: 10, max: 100, is_pf: false },
  { name: "Annual Financial Turnover ≥ ₹2 Cr", type: "FINANCIAL",   section: "Quality & Compliance", weight: 0,  max: 0,   is_pf: true  },
  { name: "Past Project References (similar)",  type: "COMPLIANCE",  section: "Quality & Compliance", weight: 15, max: 100, is_pf: false },
  // Company Profile section
  { name: "Years in Business",                  type: "TECHNICAL",   section: "Company Profile",      weight: 10, max: 100, is_pf: false },
  { name: "After-Sales Service Network",        type: "TECHNICAL",   section: "Company Profile",      weight: 15, max: 100, is_pf: false },
  { name: "Delivery Lead Time",                 type: "TECHNICAL",   section: "Company Profile",      weight: 10, max: 100, is_pf: false },
];

export const CLARIFICATIONS: Clarification[] = [
  {
    id: 1,
    q: "Please clarify whether IP44 rating is mandatory for indoor wall sconces installed in dry locations.",
    a: "IP44 rating is mandatory for all installations regardless of location as per project specification clause 3.2.1.",
    asked: "25 Aug 2025",
    answered: "26 Aug 2025",
    supplier: "ABC Lighting Co.",
    anon: true,
    published: true,
    status: "ANSWERED",
  },
  {
    id: 2,
    q: "Can we offer equivalent products if the specified model is out of stock?",
    a: "Equivalent products are acceptable provided they meet all technical specifications. Please clearly state deviations in the deviation_notes field.",
    asked: "28 Aug 2025",
    answered: "29 Aug 2025",
    supplier: "GlobeLux Industries",
    anon: false,
    published: true,
    status: "ANSWERED",
  },
  {
    id: 3,
    q: "Is the site visit on 20 Aug mandatory or optional for foreign bidders?",
    a: null,
    asked: "10 Aug 2025",
    answered: null,
    supplier: "GlobeLux Industries",
    anon: false,
    published: false,
    status: "PENDING",
  },
  {
    id: 4,
    q: "Please confirm if the BIS certification under IS 9900 is mandatory or if equivalent international certification is acceptable.",
    a: null,
    asked: "12 Aug 2025",
    answered: null,
    supplier: "Nova Electricals",
    anon: true,
    published: false,
    status: "PENDING",
  },
];

// Populate event 1 data after arrays are defined
RESPONSES_BY_EVENT[1] = RESPONSES;
CLARIFICATIONS_BY_EVENT[1] = CLARIFICATIONS;

export const SUPPLIER_CATALOGUE = [
  { name: "Zenith Electricals", country: "IN" },
  { name: "BrightPath GmbH", country: "DE" },
  { name: "Voltex Solutions", country: "US" },
  { name: "IndoLux Pvt Ltd", country: "IN" },
  { name: "EuroLight AG", country: "CH" },
  { name: "Prism Electricals", country: "IN" },
  { name: "TechnoFab Industries", country: "IN" },
  { name: "Luminary Corp", country: "SG" },
  { name: "Pacific Wiring Ltd", country: "AU" },
  { name: "AlphaVolt GmbH", country: "DE" },
];

export const DEFAULT_WIZ_STATE: WizState = {
  step: 0,
  type: "RFP",
  format: "LIST",
  category: "",
  toggles: {
    nda_required: true,
    intent_to_participate_req: true,
    allow_supplier_attachments: true,
    two_envelope_system: true,
    bid_bond_required: true,
    site_visit_required: false,
    price_negotiation_enabled: false,
  },
  items: [
    { id: 1, item_code: "LT-BRASS-001", description: "Custom Brass Wall Sconce", quantity: "500", unit: "PCS", target_price: "1200.00", technical_spec: "Brass finish, E27, IP44", required_by: "2026-01-15" },
    { id: 2, item_code: "LT-LED-002", description: "LED Retrofit Bulb 10W E27", quantity: "2000", unit: "PCS", target_price: "180.00", technical_spec: "10W, E27 base, 4000K", required_by: "2026-01-20" },
  ],
  sections: [
    {
      id: 1, title: "Technical Compliance", type: "TECHNICAL", mandatory: true,
      questions: [
        { id: 1, text: "Upload Material Certification (IS 9900:2002)", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 2, text: "Warranty Period (months)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
        { id: 3, text: "Manufacturing facility location", qtype: "SINGLE_CHOICE", mandatory: true, scored: true, weight: 10, options: ["India", "China", "Europe", "Other"] },
      ],
    },
    {
      id: 2, title: "Company Profile", type: "GENERAL", mandatory: true,
      questions: [
        { id: 4, text: "Years in business", qtype: "NUMERIC", mandatory: true, scored: false },
        { id: 5, text: "ISO 9001:2015 Certified?", qtype: "BOOLEAN", mandatory: true, scored: true, weight: 8 },
      ],
    },
  ],
  participants: [
    { id: 1, name: "ABC Lighting Co.", country: "IN", status: "INVITED" },
    { id: 2, name: "GlobeLux Industries", country: "DE", status: "INVITED" },
    { id: 3, name: "Nova Electricals", country: "IN", status: "INVITED" },
    { id: 4, name: "LightWave Solutions", country: "SG", status: "INVITED" },
  ],
  reminders: [
    { id: 1, headline: "Submission Deadline – 48h remaining", scheduled: "28 Sep 2025, 09:00", recipients: ["SUPPLIER"], sent: false, excl_sub: true },
    { id: 2, headline: "Clarification deadline tomorrow", scheduled: "14 Sep 2025, 09:00", recipients: ["SUPPLIER", "MANAGER"], sent: true, excl_sub: false },
  ],
  _inviteOpen: false,
  _inviteSearch: "",
  _inviteSelected: [],
};

export interface TemplateWizData {
  id: number;
  name: string;
  type: "RFI" | "RFP" | "RFQ";
  category: string;
  description: string;
  sections: WizSection[];
  items: WizItem[];
}

export const TEMPLATE_WIZ_DATA: TemplateWizData[] = [
  {
    id: 1, name: "Annual Lighting Contract", type: "RFQ",
    category: "Electrical & Instrumentation",
    description: "BOQ-based quotation for decorative & industrial lighting procurement.",
    items: [
      { id: 101, item_code: "LT-BRASS-001", description: "Custom Brass Wall Sconce", quantity: "500", unit: "PCS", target_price: "1200.00", technical_spec: "Brass finish, E27, IP44", required_by: "2026-01-15" },
      { id: 102, item_code: "LT-LED-002",   description: "LED Retrofit Bulb 10W E27", quantity: "2000", unit: "PCS", target_price: "180.00", technical_spec: "10W, E27 base, 4000K", required_by: "2026-01-20" },
      { id: 103, item_code: "LT-PAN-003",   description: "LED Panel Light 600×600mm", quantity: "300", unit: "PCS", target_price: "2500.00", technical_spec: "40W, 4000K, IP20", required_by: "2026-01-25" },
    ],
    sections: [
      { id: 201, title: "Technical Compliance", type: "TECHNICAL", mandatory: true, questions: [
        { id: 301, text: "Upload Material Certification (IS 9900:2002)", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 302, text: "Warranty period offered (months)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
        { id: 303, text: "Manufacturing facility location", qtype: "SINGLE_CHOICE", mandatory: true, scored: true, weight: 10, options: ["India", "China", "Europe", "Other"] },
        { id: 304, text: "Confirm IS/IEC compliance for all items", qtype: "BOOLEAN", mandatory: true, scored: false },
      ]},
      { id: 202, title: "Company Profile", type: "GENERAL", mandatory: true, questions: [
        { id: 305, text: "Years in lighting manufacturing / supply", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
        { id: 306, text: "Upload GST registration certificate", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 307, text: "Provide list of 3 reference clients with purchase value", qtype: "TEXT", mandatory: true, scored: false },
      ]},
      { id: 203, title: "HSE", type: "HSE", mandatory: false, questions: [
        { id: 308, text: "Describe packaging and transport safety measures", qtype: "TEXT", mandatory: false, scored: false },
      ]},
      { id: 204, title: "Financial", type: "FINANCIAL", mandatory: true, questions: [
        { id: 309, text: "State payment terms required", qtype: "TEXT", mandatory: true, scored: false },
        { id: 310, text: "Confirm ability to supply within lead time", qtype: "BOOLEAN", mandatory: true, scored: true, weight: 10 },
      ]},
    ],
  },
  {
    id: 2, name: "IT Hardware Refresh", type: "RFQ",
    category: "IT & Software",
    description: "Standard quotation template for annual IT hardware, peripherals and accessories refresh.",
    items: [
      { id: 111, item_code: "IT-LAP-001", description: "Business Laptop 14\" Intel i7", quantity: "50", unit: "NOS", target_price: "75000.00", technical_spec: "i7-13th Gen, 16GB RAM, 512GB SSD", required_by: "2026-02-01" },
      { id: 112, item_code: "IT-MON-002", description: "27\" 4K Monitor",              quantity: "60", unit: "NOS", target_price: "35000.00", technical_spec: "27\" 4K UHD IPS, USB-C",             required_by: "2026-02-01" },
      { id: 113, item_code: "IT-DOK-003", description: "USB-C Docking Station",         quantity: "50", unit: "NOS", target_price: "12000.00", technical_spec: "Dual display, Ethernet, USB-A/C",    required_by: "2026-02-15" },
    ],
    sections: [
      { id: 211, title: "Technical Specifications", type: "TECHNICAL", mandatory: true, questions: [
        { id: 311, text: "Confirm all items meet stated technical specifications", qtype: "BOOLEAN", mandatory: true, scored: false },
        { id: 312, text: "Warranty period for each product category (months)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 20 },
        { id: 313, text: "Upload OEM authorisation certificate", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 314, text: "State on-site support response time (hours)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
      ]},
      { id: 212, title: "Company Profile", type: "GENERAL", mandatory: true, questions: [
        { id: 315, text: "Years as authorised IT hardware reseller", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
        { id: 316, text: "Provide last 3 years of similar purchase orders", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      ]},
      { id: 213, title: "Financial", type: "FINANCIAL", mandatory: true, questions: [
        { id: 317, text: "Confirm GST-inclusive pricing in BOQ", qtype: "BOOLEAN", mandatory: true, scored: false },
        { id: 318, text: "State credit terms offered", qtype: "TEXT", mandatory: true, scored: false },
      ]},
    ],
  },
  {
    id: 3, name: "Office Furniture Procurement", type: "RFP",
    category: "Facility Management",
    description: "Proposal request for office furniture covering design, supply and installation.",
    items: [
      { id: 121, item_code: "FN-DSK-001", description: "Executive Workstation Desk",  quantity: "80",  unit: "NOS", target_price: "18000.00", technical_spec: "1800×900mm, pre-laminated board",  required_by: "2026-03-01" },
      { id: 122, item_code: "FN-CHR-002", description: "Ergonomic Office Chair",       quantity: "100", unit: "NOS", target_price: "12000.00", technical_spec: "Mesh back, lumbar support, BIFMA", required_by: "2026-03-01" },
    ],
    sections: [
      { id: 221, title: "Design & Scope", type: "TECHNICAL", mandatory: true, questions: [
        { id: 321, text: "Upload proposed floor plan / space layout", qtype: "FILE_UPLOAD", mandatory: true, scored: true, weight: 20 },
        { id: 322, text: "Describe materials and finish options", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
        { id: 323, text: "Confirm installation included in scope", qtype: "BOOLEAN", mandatory: true, scored: false },
      ]},
      { id: 222, title: "Company Profile", type: "GENERAL", mandatory: true, questions: [
        { id: 324, text: "Years supplying commercial office furniture", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
        { id: 325, text: "Upload portfolio of completed projects", qtype: "FILE_UPLOAD", mandatory: true, scored: true, weight: 15 },
      ]},
      { id: 223, title: "Compliance", type: "COMPLIANCE", mandatory: false, questions: [
        { id: 326, text: "Confirm BIFMA / IS furniture standards compliance", qtype: "BOOLEAN", mandatory: true, scored: false },
      ]},
    ],
  },
  {
    id: 4, name: "EV Charging Survey", type: "RFI",
    category: "Construction & Civil",
    description: "Market research questionnaire for EV charging infrastructure vendors and technology.",
    items: [],
    sections: [
      { id: 231, title: "Technology & Products", type: "TECHNICAL", mandatory: true, questions: [
        { id: 331, text: "List EV charging models offered (AC/DC, kW ratings)", qtype: "TEXT", mandatory: true, scored: false },
        { id: 332, text: "Describe network management / OCPP compliance", qtype: "TEXT", mandatory: true, scored: false },
        { id: 333, text: "Upload product datasheet for flagship model", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 334, text: "Do you support dynamic load management?", qtype: "BOOLEAN", mandatory: true, scored: false },
      ]},
      { id: 232, title: "Company Profile", type: "GENERAL", mandatory: true, questions: [
        { id: 335, text: "Years in EV charging infrastructure business", qtype: "NUMERIC", mandatory: true, scored: false },
        { id: 336, text: "Total chargers deployed in India", qtype: "NUMERIC", mandatory: true, scored: false },
        { id: 337, text: "List key clients with charger count", qtype: "TEXT", mandatory: true, scored: false },
        { id: 338, text: "Provide service network coverage by state", qtype: "TEXT", mandatory: false, scored: false },
      ]},
    ],
  },
  {
    id: 5, name: "Security Systems RFQ", type: "RFQ",
    category: "Construction & Civil",
    description: "BOQ-based quotation for campus security infrastructure including CCTV and access control.",
    items: [
      { id: 131, item_code: "SC-CAM-001", description: "IP Dome Camera 4MP",       quantity: "120", unit: "NOS", target_price: "8500.00",  technical_spec: "4MP, IR 30m, IP66, H.265",       required_by: "2026-02-15" },
      { id: 132, item_code: "SC-NVR-002", description: "32-channel NVR",            quantity: "5",   unit: "NOS", target_price: "95000.00", technical_spec: "32ch, 4K decode, RAID",          required_by: "2026-02-15" },
      { id: 133, item_code: "SC-ACC-003", description: "Access Control Reader",     quantity: "40",  unit: "NOS", target_price: "12000.00", technical_spec: "RFID + PIN, Wiegand, IP65",       required_by: "2026-03-01" },
      { id: 134, item_code: "SC-CTR-004", description: "Access Control Controller", quantity: "10",  unit: "NOS", target_price: "25000.00", technical_spec: "4-door, TCP/IP, backup battery",  required_by: "2026-03-01" },
    ],
    sections: [
      { id: 241, title: "Technical Compliance", type: "TECHNICAL", mandatory: true, questions: [
        { id: 341, text: "Confirm all equipment meets stated technical specifications", qtype: "BOOLEAN", mandatory: true, scored: false },
        { id: 342, text: "Warranty period offered (months)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 15 },
        { id: 343, text: "Upload product datasheets for all major items", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
        { id: 344, text: "Describe VMS / PSIM integration capability", qtype: "TEXT", mandatory: true, scored: true, weight: 15 },
      ]},
      { id: 242, title: "Installation & Commissioning", type: "TECHNICAL", mandatory: true, questions: [
        { id: 345, text: "Proposed installation timeline (weeks from PO)", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
        { id: 346, text: "Confirm commissioning and operator training included", qtype: "BOOLEAN", mandatory: true, scored: false },
      ]},
      { id: 243, title: "Compliance", type: "COMPLIANCE", mandatory: true, questions: [
        { id: 347, text: "Confirm BIS / ONVIF certification for cameras", qtype: "BOOLEAN", mandatory: true, scored: false },
        { id: 348, text: "Upload valid electrical contractor license", qtype: "FILE_UPLOAD", mandatory: true, scored: false },
      ]},
      { id: 244, title: "Company Profile", type: "GENERAL", mandatory: true, questions: [
        { id: 349, text: "Years in security system integration", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
        { id: 350, text: "Number of cameras installed in last 3 years", qtype: "NUMERIC", mandatory: true, scored: true, weight: 10 },
      ]},
      { id: 245, title: "Financial", type: "FINANCIAL", mandatory: true, questions: [
        { id: 351, text: "Confirm AMC pricing quoted separately", qtype: "BOOLEAN", mandatory: true, scored: false },
        { id: 352, text: "State payment milestone terms", qtype: "TEXT", mandatory: true, scored: false },
      ]},
    ],
  },
];

export const TYPE_CONFIG: Record<string, {
  color: string; bg: string; name: string; tagline: string;
  steps: string[]; stepSubs: string[];
  showItems: boolean; showPricing: boolean; showBidBond: boolean;
  showTwoEnvelope: boolean; showSiteVisit: boolean; showTechFields: boolean; showEvalCriteria: boolean;
  itemsLabel?: string; itemsNote?: string;
  togglesToShow: string[];
  infoBox?: string;
}> = {
  RFI: {
    color: "#6366f1", bg: "#eef2ff", name: "Request for Information", tagline: "Market research – no pricing collected",
    steps: ["Event type", "Basic details", "Documents", "Questionnaire", "Participants", "Reminders", "Review"],
    stepSubs: ["RFI / RFP / RFQ", "Title, dates, settings", "Specs & NDA", "Qualification questions", "Invite suppliers", "Schedule reminders", "Final check"],
    showItems: false, showPricing: false, showBidBond: false, showTwoEnvelope: false, showSiteVisit: false, showTechFields: false, showEvalCriteria: false,
    togglesToShow: ["nda_required", "intent_to_participate_req", "allow_supplier_attachments"],
    infoBox: "RFI collects qualitative information only. No BOQ, no pricing, no bid bond. Questionnaire is the primary response mechanism.",
  },
  RFP: {
    color: "#0ea5e9", bg: "#e0f2fe", name: "Request for Proposal", tagline: "Proposals with pricing & methodology – weighted evaluation",
    steps: ["Event type", "Basic details", "Deliverables", "Documents", "Questionnaire", "Participants", "Reminders", "Review"],
    stepSubs: ["RFI / RFP / RFQ", "Title, dates, settings", "Optional scope items", "Specs & T&Cs", "Evaluation questions", "Invite suppliers", "Schedule reminders", "Final check"],
    showItems: true, showPricing: true, showBidBond: false, showTwoEnvelope: false, showSiteVisit: false, showTechFields: false, showEvalCriteria: true,
    itemsLabel: "Deliverables / scope items",
    itemsNote: "Deliverables are optional for RFP. Add items to request line-level pricing.",
    togglesToShow: ["nda_required", "intent_to_participate_req", "allow_supplier_attachments", "price_negotiation_enabled"],
    infoBox: "RFP collects detailed proposals with pricing, methodology, and team qualifications. Award is based on weighted technical + commercial score.",
  },
  RFQ: {
    color: "#f59e0b", bg: "#fef3c7", name: "Request for Quotation", tagline: "Competitive price comparison – BOQ mandatory",
    steps: ["Event type", "Basic details", "Line items (BOQ)", "Documents", "Questionnaire", "Participants", "Reminders", "Review"],
    stepSubs: ["RFI / RFP / RFQ", "Title, dates, settings", "Mandatory BOQ & quantities", "Specs & T&Cs", "Optional questions", "Invite suppliers", "Schedule reminders", "Final check"],
    showItems: true, showPricing: true, showBidBond: true, showTwoEnvelope: false, showSiteVisit: false, showTechFields: false, showEvalCriteria: false,
    itemsLabel: "Line items / Bill of Quantities",
    itemsNote: "Line items are mandatory for RFQ. Suppliers will price each line.",
    togglesToShow: ["nda_required", "allow_supplier_attachments", "bid_bond_required", "price_negotiation_enabled"],
    infoBox: "RFQ requires a complete BOQ. Suppliers submit sealed unit prices per line item. Award goes to the L1 (lowest qualified price).",
  },
};
