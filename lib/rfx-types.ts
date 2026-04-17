export type EventType = "RFI" | "RFP" | "RFQ" | "RFT";
export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "OPEN"
  | "UNDER_EVALUATION"
  | "AWARDED"
  | "CANCELLED";
export type EnvelopeStatus = "SEALED" | "OPENED";
export type ResponseStatus = "SUBMITTED" | "WITHDRAWN" | "DISQUALIFIED";
export type ClarifStatus = "PENDING" | "ANSWERED";
export type ParticipantStatus =
  | "INVITED"
  | "ACCEPTED"
  | "SUBMITTED"
  | "DECLINED";

export interface RFXEvent {
  id: number;
  number: string;
  type: EventType;
  title: string;
  status: EventStatus;
  deadline: string;
  responses: number;
  qualified: number;
}

export interface ActiveEvent {
  id: number;
  number: string;
  type: EventType;
  title: string;
  status: EventStatus;
  deadline: string;
  two_envelope: boolean;
  tech_opening: string;
  fin_opening: string;
  tech_phase: EnvelopeStatus;
  fin_phase: EnvelopeStatus;
  min_qual_score: number;
}

export interface SupplierAnswer {
  section: string;
  q: string;
  type: string;
  val: string | null;
  score: number | null;
}

export interface LineItem {
  code: string;
  desc: string;
  qty: number;
  unit: string;
  unit_price: number | null;
  total: number | null;
}

export interface SupplierResponse {
  id: number;
  supplier: string;
  country: string;
  submitted: string;
  status: ResponseStatus | "WITHDRAWN";
  tech_env: EnvelopeStatus;
  fin_env: EnvelopeStatus;
  tech_score: number | null;
  fin_env_amount: number | null;
  rank: number | null;
  is_l1: boolean;
  is_disqualified: boolean;
  disqualify_reason?: string;
  is_awarded?: boolean;
  items: LineItem[];
  answers: SupplierAnswer[];
}

export interface Clarification {
  id: number;
  q: string;
  a: string | null;
  asked: string;
  answered: string | null;
  supplier: string;
  anon: boolean;
  published: boolean;
  status: ClarifStatus;
}

export interface EvalCriterion {
  name: string;
  type: string;
  weight: number;
  max: number;
  is_pf: boolean;
}

export interface WizQuestion {
  id: number;
  text: string;
  qtype: string;
  mandatory: boolean;
  scored: boolean;
  weight?: number;
  options?: string[];
}

export interface WizSection {
  id: number;
  title: string;
  type: string;
  mandatory: boolean;
  questions: WizQuestion[];
}

export interface WizItem {
  id: number;
  item_code: string;
  description: string;
  quantity: string;
  unit: string;
  target_price: string;
  technical_spec: string;
  required_by: string;
}

export interface WizParticipant {
  id: number;
  name: string;
  country: string;
  status: ParticipantStatus;
}

export interface WizReminder {
  id: number;
  headline: string;
  scheduled: string;
  recipients: string[];
  sent: boolean;
  excl_sub: boolean;
}

export interface WizToggles {
  nda_required: boolean;
  intent_to_participate_req: boolean;
  allow_supplier_attachments: boolean;
  two_envelope_system: boolean;
  bid_bond_required: boolean;
  site_visit_required: boolean;
  price_negotiation_enabled: boolean;
}

export interface WizState {
  step: number;
  type: EventType;
  toggles: WizToggles;
  items: WizItem[];
  sections: WizSection[];
  participants: WizParticipant[];
  reminders: WizReminder[];
  _inviteOpen?: boolean;
  _inviteSearch?: string;
  _inviteSelected?: string[];
}

export interface ScoreEntry {
  score: string;
  pf: "PASS" | "FAIL" | null;
  comment: string;
}

export interface RespState {
  tab: "responses" | "evaluation" | "financial" | "clarifications";
  evalSupplier: SupplierResponse | null;
  clarifOpen: number | null;
  showAnswer: "ALL" | "PENDING" | "ANSWERED";
  scores: Record<string, ScoreEntry>;
}

export type AppView =
  | "dashboard"
  | "events"
  | "wizard"
  | "responses"
  | "eval"
  | "clarif"
  | "award"
  | "published"
  | "suppliers"
  | "templates"
  | "reports"
  | "settings";
