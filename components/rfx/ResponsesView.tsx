"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge, EnvelopeBadge, InfoBox, ScoreBar, StatCard } from "./shared";
import type { ActiveEvent, SupplierResponse, Clarification, EvalCriterion, RespState, AppView } from "@/lib/rfx-types";
import {
  ChevronLeft, Lock, Unlock, Award, X, CheckCircle2,
  FileText, Search, MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ResponsesViewProps {
  event: ActiveEvent;
  responses: SupplierResponse[];
  clarifications: Clarification[];
  criteria: EvalCriterion[];
  onNavigate: (view: AppView) => void;
  onUpdateEvent: (patch: Partial<ActiveEvent>) => void;
  onUpdateResponses: (responses: SupplierResponse[]) => void;
  onUpdateClarifications: (clarifications: Clarification[]) => void;
}

type RespTab = "responses" | "evaluation" | "financial" | "clarifications";
type ClarifFilter = "ALL" | "PENDING" | "ANSWERED";
type AppSubView = "list" | "eval" | "award";

export function ResponsesView({
  event, responses, clarifications, criteria,
  onNavigate, onUpdateEvent, onUpdateResponses, onUpdateClarifications,
}: ResponsesViewProps) {
  const [tab, setTab] = useState<RespTab>("responses");
  const [subView, setSubView] = useState<AppSubView>("list");
  const [evalSupplier, setEvalSupplier] = useState<SupplierResponse | null>(null);
  const [scores, setScores] = useState<Record<string, { score: string; pf: "PASS" | "FAIL" | null; comment: string }>>({});
  const [clarifOpen, setClarifOpen] = useState<number | null>(null);
  const [clarifFilter, setClarifFilter] = useState<ClarifFilter>("ALL");
  const [minQual, setMinQual] = useState(event.min_qual_score);

  const submitted = responses.filter(r => r.status === "SUBMITTED");
  const qualified = submitted.filter(r => !r.is_disqualified);
  const disq = submitted.filter(r => r.is_disqualified);
  const finOpened = event.fin_phase === "OPENED";

  /* ── Award sub-view ─────────────────────────────────────────── */
  if (subView === "award") {
    return (
      <AwardPage
        event={event} responses={responses} criteria={criteria}
        onBack={() => setSubView("list")}
        onConfirm={(suppId, amount, notes) => {
          const updated = responses.map(r => ({ ...r, is_awarded: r.id === suppId }));
          onUpdateResponses(updated);
          onUpdateEvent({ status: "AWARDED" });
          setSubView("list");
        }}
      />
    );
  }

  /* ── Eval sub-view ──────────────────────────────────────────── */
  if (subView === "eval" && evalSupplier) {
    return (
      <EvalPage
        supplier={evalSupplier} criteria={criteria} scores={scores}
        minQual={minQual}
        onBack={() => setSubView("list")}
        onSave={(suppId, total) => {
          const updated = responses.map(r =>
            r.id !== suppId ? r : {
              ...r, tech_score: parseFloat(total.toFixed(1)),
              is_disqualified: total < minQual,
              disqualify_reason: total < minQual ? `Technical score ${total.toFixed(1)} below minimum qualification threshold of ${minQual}.` : undefined,
            }
          );
          onUpdateResponses(updated);
          setSubView("list");
          setTab("evaluation");
        }}
        setScores={setScores}
      />
    );
  }

  /* ── Main tabs view ─────────────────────────────────────────── */
  const tabs: { key: RespTab; label: string; count: number; locked?: boolean }[] = [
    { key: "responses", label: "Supplier Responses", count: responses.length },
    { key: "evaluation", label: "Evaluation & Scoring", count: qualified.length },
    { key: "financial", label: "Financial Envelopes", count: qualified.filter(r => r.fin_env === "OPENED").length, locked: !finOpened },
    { key: "clarifications", label: "Q&A / Clarifications", count: clarifications.length },
  ];

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TypeBadge type={event.type} />
            <span className="font-mono text-[12px] text-slate-400">{event.number}</span>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-[18px] font-semibold text-slate-900">{event.title}</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">{event.type} · Submission closed: {event.deadline}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[12px] text-slate-500">Min qualification score:</span>
            <Input type="number" min={0} max={100} value={minQual}
              onChange={e => setMinQual(parseInt(e.target.value) || 0)}
              onBlur={() => onUpdateEvent({ min_qual_score: minQual })}
              className="w-16 h-7 text-[12px] text-center px-1" />
            <span className="text-[12px] text-slate-400">/ 100 – suppliers below this score are excluded from financial evaluation</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate("events")} className="gap-1">
            <ChevronLeft size={13} /> All events
          </Button>
          {event.status !== "CANCELLED" && event.status !== "AWARDED" && (
            finOpened
              ? <Button size="sm" onClick={() => setSubView("award")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Award size={13} /> Award contract
                </Button>
              : <Button size="sm" onClick={() => handleOpenEnvelopes()} className="gap-1.5">
                  <Unlock size={13} /> Open financial envelopes
                </Button>
          )}
          {event.status !== "CANCELLED" && event.status !== "AWARDED" && (
            <Button variant="destructive" size="sm" onClick={handleCancelEvent} className="gap-1">
              <X size={12} /> Cancel event
            </Button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        <StatCard value={responses.length} label="Total invited" />
        <StatCard value={submitted.length} label="Submitted" />
        <StatCard value={qualified.length} label="Qualified" />
        <StatCard value={disq.length} label="Disqualified" />
        <StatCard value={clarifications.filter(c => c.status === "PENDING").length} label="Pending Q&A" />
      </div>

      {/* Status banner */}
      {event.status === "CANCELLED" && (
        <InfoBox variant="red"><strong>Event cancelled.</strong> This event was cancelled. No further actions can be taken. All invited suppliers have been notified.</InfoBox>
      )}
      {event.status === "AWARDED" && (
        <InfoBox variant="green"><strong>Contract awarded.</strong> The awarded supplier has been notified. The contract award has been recorded.</InfoBox>
      )}
      {event.status !== "CANCELLED" && event.status !== "AWARDED" && event.two_envelope && (
        <InfoBox variant="amber">
          <strong>Two-envelope event.</strong> Technical envelopes opened {event.tech_opening}. Financial envelopes {finOpened ? <strong>opened {event.fin_opening}</strong> : `sealed until ${event.fin_opening}`}. {finOpened ? "You may now proceed to award." : "Score all suppliers to unlock the financial envelope tab."}
        </InfoBox>
      )}

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200 px-5">
          {tabs.map(t => (
            <button key={t.key} disabled={t.locked}
              onClick={() => !t.locked && setTab(t.key)}
              className={cn(
                "px-4 py-3 text-[13px] border-b-2 mb-[-1px] transition-all",
                tab === t.key ? "text-sky-600 border-sky-500 font-medium" : "text-slate-500 border-transparent hover:text-slate-800",
                t.locked && "opacity-40 cursor-not-allowed"
              )}>
              {t.label}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                {t.count}{t.locked ? " 🔒" : ""}
              </span>
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "responses" && (
            <ResponsesTab responses={responses} minQual={minQual}
              onEval={r => { setEvalSupplier(r); setScores({}); setSubView("eval"); }}
              onDisqualify={id => {
                onUpdateResponses(responses.map(r => r.id !== id ? r : { ...r, is_disqualified: true, disqualify_reason: "Manually disqualified by procurement manager." }));
              }} />
          )}
          {tab === "evaluation" && (
            <EvaluationTab responses={responses} qualified={qualified} minQual={minQual}
              onEval={r => { setEvalSupplier(r); setScores({}); setSubView("eval"); }}
              onOpenEnvelopes={handleOpenEnvelopes} />
          )}
          {tab === "financial" && finOpened && (
            <FinancialTab qualified={qualified} event={event} onAward={() => setSubView("award")} />
          )}
          {tab === "clarifications" && (
            <ClarificationsTab clarifications={clarifications} filter={clarifFilter}
              setFilter={setClarifFilter} clarifOpen={clarifOpen} setClarifOpen={setClarifOpen}
              onSubmitAnswer={(id, ans, publish) => {
                onUpdateClarifications(clarifications.map(c =>
                  c.id !== id ? c : { ...c, a: ans, status: "ANSWERED" as const, answered: "Now", published: publish }
                ));
                setClarifOpen(null);
              }}
              onPublish={id => onUpdateClarifications(clarifications.map(c => c.id !== id ? c : { ...c, published: true }))}
            />
          )}
        </div>
      </div>
    </div>
  );

  function handleOpenEnvelopes() {
    const qualScored = qualified.filter(r => r.tech_score != null && r.tech_score >= minQual);
    if (qualScored.length === 0) { alert(`No qualified suppliers to open envelopes for.`); return; }
    const amounts = [525000, 490000, 580000, 610000, 470000];
    let ai = 0;
    const updated = responses.map(r => {
      if (qualScored.find(q => q.id === r.id)) {
        return { ...r, fin_env: "OPENED" as const, fin_env_amount: amounts[ai++ % amounts.length] };
      }
      return r;
    });
    onUpdateResponses(updated);
    onUpdateEvent({ fin_phase: "OPENED" });
    setTab("financial");
  }
  function handleCancelEvent() {
    if (!confirm(`Cancel event ${event.number}?\n\nAll submitted suppliers will be notified with EVT_CANCELLED. This action cannot be undone.`)) return;
    onUpdateEvent({ status: "CANCELLED" });
  }
}

/* ── Responses tab ──────────────────────────────────────────────── */
function ResponsesTab({ responses, minQual, onEval, onDisqualify }: {
  responses: SupplierResponse[]; minQual: number;
  onEval: (r: SupplierResponse) => void; onDisqualify: (id: number) => void;
}) {
  return (
    <>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Supplier", "Status", "Envelopes", "Tech score", "Actions"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map(r => {
            const scoreOk = r.tech_score != null && r.tech_score >= minQual && !r.is_disqualified && r.status === "SUBMITTED";
            return (
              <tr key={r.id} className={cn("border-b border-slate-100 last:border-0", scoreOk && "bg-emerald-50/40")}>
                <td className="px-3 py-3">
                  <div className="text-[13px] font-medium text-slate-900">{r.supplier}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{r.country} · Submitted: {r.submitted}</div>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.is_disqualified ? "DISQUALIFIED" : r.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <EnvelopeBadge label="Tech" status={r.tech_env} />
                    <EnvelopeBadge label="Fin" status={r.fin_env} />
                  </div>
                </td>
                <td className="px-3 py-3 min-w-[130px]">
                  {r.tech_score != null ? (
                    <>
                      <span className={cn("text-[13px] font-semibold", r.tech_score >= minQual ? "text-emerald-600" : "text-red-500")}>
                        {r.tech_score.toFixed(1)}<span className="text-[11px] text-slate-400 font-normal"> / 100</span>
                      </span>
                      <ScoreBar value={r.tech_score} pass={r.tech_score >= minQual} />
                    </>
                  ) : <span className="text-[11px] text-slate-400">Not scored</span>}
                </td>
                <td className="px-3 py-3">
                  {r.status === "SUBMITTED" && !r.is_disqualified ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => onEval(r)}>Score</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[12px] text-red-600 border-red-200 hover:bg-red-50" onClick={() => onDisqualify(r.id)}>Disqualify</Button>
                    </div>
                  ) : r.is_disqualified ? (
                    <span className="text-[11px] text-red-500">{r.disqualify_reason}</span>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[12px] text-slate-400 mt-3">Min qualification score: {minQual}/100 – suppliers below this threshold are excluded from financial evaluation.</p>
    </>
  );
}

/* ── Evaluation tab ─────────────────────────────────────────────── */
function EvaluationTab({ responses, qualified, minQual, onEval, onOpenEnvelopes }: {
  responses: SupplierResponse[]; qualified: SupplierResponse[]; minQual: number;
  onEval: (r: SupplierResponse) => void; onOpenEnvelopes: () => void;
}) {
  const evalProgress = responses.filter(r => r.tech_score != null && !r.is_disqualified).length;
  const total = responses.filter(r => r.status === "SUBMITTED" && !r.is_disqualified).length;
  const pct = total > 0 ? Math.round((evalProgress / total) * 100) : 0;
  const C = 50.27; // 2π×8 (r=8 for viewBox 20)
  const offset = C - (pct / 100) * C;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg viewBox="0 0 20 20" className="w-9 h-9 -rotate-90">
              <circle cx="10" cy="10" r="8" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <circle cx="10" cy="10" r="8" fill="none" stroke="#0ea5e9" strokeWidth="2.5"
                strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" className="transition-all" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{pct}%</span>
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-800">Evaluation progress</div>
            <div className="text-[11px] text-slate-400">{evalProgress} of {total} suppliers scored</div>
          </div>
        </div>
        {evalProgress === total && total > 0
          ? <Button size="sm" onClick={onOpenEnvelopes} className="gap-1.5"><Unlock size={13} /> Open financial envelopes</Button>
          : <span className="text-[12px] text-slate-400">Score all suppliers to unlock financial envelopes</span>
        }
      </div>
      <InfoBox variant="blue">Score each supplier against the defined criteria. Suppliers scoring below {minQual}/100 will not advance to the financial stage.</InfoBox>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Supplier", "Tech score", "Result", "Tech envelope", "Actions"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {qualified.map(r => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-3">
                <div className="text-[13px] font-medium text-slate-900">{r.supplier}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.country}</div>
              </td>
              <td className="px-3 py-3 min-w-[130px]">
                {r.tech_score != null ? (
                  <>
                    <span className={cn("text-[14px] font-bold", r.tech_score >= minQual ? "text-emerald-600" : "text-red-500")}>{r.tech_score.toFixed(1)}</span>
                    <ScoreBar value={r.tech_score} pass={r.tech_score >= minQual} />
                  </>
                ) : <span className="text-[11px] text-slate-400">Pending</span>}
              </td>
              <td className="px-3 py-3">
                <StatusBadge
                  status={r.tech_score == null ? "PENDING" : r.tech_score >= minQual ? "PASSED" : "FAILED"}
                  label={r.tech_score == null ? "Pending" : r.tech_score >= minQual ? "Qualifies" : "Below threshold"}
                />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={r.tech_env} />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1.5">
                  <Button size="sm" onClick={() => onEval(r)} className="h-7 text-[12px]">{r.tech_score != null ? "Update scores" : "Score now"}</Button>
                  <Button size="sm" variant="outline" onClick={() => onEval(r)} className="h-7 text-[12px]">View answers</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/* ── Financial tab ──────────────────────────────────────────────── */
function FinancialTab({ qualified, event, onAward }: {
  qualified: SupplierResponse[]; event: ActiveEvent; onAward: () => void;
}) {
  const opened = qualified.filter(r => r.fin_env === "OPENED");
  if (opened.length === 0) {
    return <InfoBox variant="amber">Financial envelopes have not been opened yet. Complete technical evaluation for all qualified suppliers first.</InfoBox>;
  }
  const sorted = [...opened].sort((a, b) => (a.fin_env_amount ?? 0) - (b.fin_env_amount ?? 0));
  sorted.forEach((r, i) => { r.rank = i + 1; r.is_l1 = i === 0; });

  return (
    <>
      <InfoBox variant="green"><strong>Financial envelopes opened.</strong> Bids are ranked by price. The L1 supplier submitted the lowest qualifying bid. Proceed to award once review is complete.</InfoBox>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Rank & Supplier", "Tech score", "Bid amount", "Envelope", "Actions"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.id} className={cn("border-b border-slate-100 last:border-0", r.is_l1 && "bg-emerald-50/40")}>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">#{r.rank}</span>
                  <div>
                    <div className="text-[13px] font-medium text-slate-900">{r.supplier}</div>
                    <div className="text-[11px] text-slate-400">{r.country}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <span className={cn("text-[13px] font-semibold", r.tech_score != null && r.tech_score >= event.min_qual_score ? "text-emerald-600" : "text-red-500")}>
                  {r.tech_score?.toFixed(1) ?? "—"}/100
                </span>
              </td>
              <td className="px-3 py-3">
                {r.fin_env_amount != null ? (
                  <div>
                    <div className="text-[14px] font-bold text-slate-900">₹{r.fin_env_amount.toLocaleString("en-IN")}</div>
                    {r.is_l1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">L1 – Lowest bid</span>}
                  </div>
                ) : "—"}
              </td>
              <td className="px-3 py-3"><StatusBadge status="OPENED" /></td>
              <td className="px-3 py-3">
                {event.status !== "AWARDED" && event.status !== "CANCELLED" && (
                  <Button size="sm" className="h-7 text-[12px]" onClick={onAward}>Award contract</Button>
                )}
                {r.is_awarded && <StatusBadge status="AWARDED" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-[12px] text-slate-500">{opened.length} financial bids opened · L1 bid: ₹{sorted[0]?.fin_env_amount?.toLocaleString("en-IN") ?? "—"}</span>
        {event.status !== "AWARDED" && event.status !== "CANCELLED" && (
          <Button onClick={onAward} className="gap-1.5"><CheckCircle2 size={13} /> Proceed to award</Button>
        )}
      </div>
    </>
  );
}

/* ── Clarifications tab ─────────────────────────────────────────── */
function ClarificationsTab({ clarifications, filter, setFilter, clarifOpen, setClarifOpen, onSubmitAnswer, onPublish }: {
  clarifications: Clarification[]; filter: ClarifFilter;
  setFilter: (f: ClarifFilter) => void; clarifOpen: number | null;
  setClarifOpen: (id: number | null) => void;
  onSubmitAnswer: (id: number, ans: string, publish: boolean) => void;
  onPublish: (id: number) => void;
}) {
  const [answerText, setAnswerText] = useState<Record<number, string>>({});
  const pending = clarifications.filter(c => c.status === "PENDING");
  const answered = clarifications.filter(c => c.status === "ANSWERED");
  const filtered = filter === "PENDING" ? pending : filter === "ANSWERED" ? answered : clarifications;

  const FILTERS: ClarifFilter[] = ["ALL", "PENDING", "ANSWERED"];
  const counts: Record<ClarifFilter, number> = { ALL: clarifications.length, PENDING: pending.length, ANSWERED: answered.length };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0 border-b border-slate-200">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 text-[13px] border-b-2 mb-[-1px] transition-all",
                filter === f ? "text-sky-600 border-sky-500 font-medium" : "text-slate-500 border-transparent hover:text-slate-800"
              )}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>
      <InfoBox variant="blue">
        Answer each question individually. Use "Publish to all" to share the Q&A with every invited supplier. Unpublished answers are only visible to the buyer.
      </InfoBox>
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <StatusBadge status={c.status} />
              {c.published
                ? <StatusBadge status="PUBLISHED" label="Published to all" />
                : <span className="text-[11px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Not published</span>
              }
              {c.anon
                ? <span className="text-[11px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Anonymous</span>
                : <span className="text-[11px] text-slate-400">from {c.supplier}</span>
              }
              <span className="text-[11px] text-slate-400 ml-auto">Asked: {c.asked}</span>
            </div>
            <p className="text-[13px] font-medium text-slate-800 leading-relaxed mb-3">{c.q}</p>
            {c.a ? (
              <div className="bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-r-lg p-3 text-[13px] text-slate-800 leading-relaxed">
                {c.a}
                <div className="text-[11px] text-slate-400 mt-1.5">Answered: {c.answered}{c.published ? " · Published to all suppliers" : ""}</div>
              </div>
            ) : (
              <p className="text-[12px] text-slate-400 italic">No answer yet.</p>
            )}
            {c.status === "PENDING" && (
              <div className="mt-3">
                {clarifOpen === c.id ? (
                  <>
                    <Textarea
                      placeholder="Type your answer…"
                      value={answerText[c.id] ?? ""}
                      onChange={e => setAnswerText(p => ({ ...p, [c.id]: e.target.value }))}
                      className="min-h-[80px] text-[13px] mb-2.5"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onSubmitAnswer(c.id, answerText[c.id] ?? "", false)} className="h-7 text-[12px]">Save (internal only)</Button>
                      <Button size="sm" onClick={() => onSubmitAnswer(c.id, answerText[c.id] ?? "", true)} className="h-7 text-[12px]">Answer & publish to all suppliers</Button>
                      <Button size="sm" variant="ghost" onClick={() => setClarifOpen(null)} className="h-7 text-[12px]">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setClarifOpen(c.id)} className="h-7 text-[12px]">Write answer</Button>
                )}
              </div>
            )}
            {c.status === "ANSWERED" && !c.published && (
              <div className="mt-3">
                <Button size="sm" onClick={() => onPublish(c.id)} className="h-7 text-[12px]">Publish to all suppliers</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Eval page (full screen) ────────────────────────────────────── */
function EvalPage({ supplier, criteria, scores, minQual, onBack, onSave, setScores }: {
  supplier: SupplierResponse; criteria: EvalCriterion[];
  scores: Record<string, { score: string; pf: "PASS" | "FAIL" | null; comment: string }>;
  minQual: number;
  onBack: () => void;
  onSave: (suppId: number, total: number) => void;
  setScores: React.Dispatch<React.SetStateAction<Record<string, { score: string; pf: "PASS" | "FAIL" | null; comment: string }>>>;
}) {
  function scoreKey(name: string) { return `${supplier.id}:${name}`; }
  function getScore(name: string) { return scores[scoreKey(name)] ?? { score: "", pf: null, comment: "" }; }
  function setField(name: string, field: string, val: unknown) {
    setScores(s => ({ ...s, [scoreKey(name)]: { ...getScore(name), [field]: val } }));
  }

  const totalWeighted = criteria.filter(c => !c.is_pf).reduce((s, c) => {
    const sc = getScore(c.name);
    return s + (sc.score !== "" ? (parseFloat(sc.score || "0") / c.max) * c.weight : 0);
  }, 0);

  const CRIT_TYPE_COLORS: Record<string, string> = {
    TECHNICAL: "bg-sky-50 text-sky-700 border-sky-200",
    COMPLIANCE: "bg-red-50 text-red-700 border-red-200",
    FINANCIAL: "bg-amber-50 text-amber-700 border-amber-200",
    HSE: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Evaluate: {supplier.supplier}</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">{supplier.country} · Submitted: {supplier.submitted}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ChevronLeft size={13} /> Back</Button>
          <Button size="sm" onClick={() => onSave(supplier.id, totalWeighted)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 size={13} /> Save & return
          </Button>
        </div>
      </div>

      {/* Answers */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-800">Questionnaire answers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Section", "Question", "Answer"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplier.answers.map((a, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2.5 text-[12px] text-slate-400">{a.section}</td>
                  <td className="px-3 py-2.5 text-[13px] text-slate-700">{a.q}</td>
                  <td className="px-3 py-2.5">
                    {a.type === "FILE_UPLOAD"
                      ? <span className="flex items-center gap-1.5 text-[12px] text-sky-600"><FileText size={12} />{a.val ?? "No file uploaded"}</span>
                      : <span className="text-[13px] font-medium text-slate-800">{a.val ?? "—"}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-800">Evaluation criteria scoring</span>
          <span className="text-[13px] text-slate-500">
            Projected score: <strong className={totalWeighted >= minQual ? "text-emerald-600" : "text-red-500"}>{totalWeighted.toFixed(1)} / 100</strong>
          </span>
        </div>
        <div className="p-4">
          {/* header row */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2.5 pb-2 mb-1 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
            <div>Criterion</div><div className="text-center">Score</div><div className="text-center">Weight</div><div className="text-center">Contribution</div><div>Comment</div>
          </div>
          {criteria.map(cr => {
            const sc = getScore(cr.name);
            const contrib = !cr.is_pf && sc.score !== "" ? ((parseFloat(sc.score || "0") / cr.max) * cr.weight).toFixed(1) : "—";
            return (
              <div key={cr.name} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2.5 py-2.5 border-b border-slate-50 last:border-0 items-center">
                <div>
                  <div className="text-[13px] text-slate-800">{cr.name}</div>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 inline-block", CRIT_TYPE_COLORS[cr.type] ?? "bg-slate-50 text-slate-400 border-slate-200")}>
                    {cr.type}
                  </span>
                  {cr.is_pf && (
                    <div className="flex gap-1.5 mt-1.5">
                      {(["PASS", "FAIL"] as const).map(v => (
                        <button key={v} onClick={() => setField(cr.name, "pf", v)}
                          className={cn("text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all",
                            sc.pf === v
                              ? v === "PASS" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-red-100 text-red-700 border-red-300"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          )}>{v}</button>
                      ))}
                    </div>
                  )}
                </div>
                {cr.is_pf ? (
                  <><div className="text-[12px] text-slate-400 text-center col-span-3">Pass/fail gate</div><div /></>
                ) : (
                  <>
                    <div>
                      <Input type="number" min={0} max={cr.max} value={sc.score}
                        onChange={e => setField(cr.name, "score", e.target.value)}
                        className="h-8 text-[12px] text-center" placeholder={`0–${cr.max}`} />
                    </div>
                    <div className="text-[12px] text-slate-400 text-center">×{cr.weight}%</div>
                    <div className="text-[12px] font-medium text-emerald-600 text-center">{contrib}</div>
                    <div>
                      <Input value={sc.comment} onChange={e => setField(cr.name, "comment", e.target.value)}
                        className="h-8 text-[11px]" placeholder="Comment…" />
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Total row */}
          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-200 bg-slate-50 rounded-lg px-4 py-3">
            <div className="text-[13px] text-slate-600">
              Total weighted score:{" "}
              <strong className={cn("text-[16px]", totalWeighted >= minQual ? "text-emerald-600" : "text-red-500")}>
                {totalWeighted.toFixed(1)} / 100
              </strong>
              {totalWeighted >= minQual
                ? <span className="text-[11px] text-emerald-600 ml-2">Qualifies (≥{minQual})</span>
                : <span className="text-[11px] text-red-500 ml-2">Below threshold ({minQual})</span>
              }
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>
              <Button size="sm" onClick={() => onSave(supplier.id, totalWeighted)} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                <CheckCircle2 size={13} /> Save & return
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Award page ─────────────────────────────────────────────────── */
function AwardPage({ event, responses, criteria, onBack, onConfirm }: {
  event: ActiveEvent; responses: SupplierResponse[]; criteria: EvalCriterion[];
  onBack: () => void;
  onConfirm: (suppId: number, amount: string, notes: string) => void;
}) {
  const qualified = responses.filter(r => r.status === "SUBMITTED" && !r.is_disqualified);
  const sorted = qualified.filter(r => r.fin_env === "OPENED").sort((a, b) => (a.fin_env_amount ?? 0) - (b.fin_env_amount ?? 0));
  const l1 = sorted[0];

  const [selectedId, setSelectedId] = useState<number>(qualified[0]?.id ?? 0);
  const [amount, setAmount] = useState(l1?.fin_env_amount?.toLocaleString("en-IN") ?? "");
  const [notes, setNotes] = useState("L1 qualified bid meeting all technical requirements. Recommended by evaluation committee on 18 Oct 2025.");
  const [startDate, setStartDate] = useState("2025-11-01");
  const [duration, setDuration] = useState("24");

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Award contract</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Select the supplier to award the contract to. The decision is final once confirmed.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ChevronLeft size={13} /> Back</Button>
      </div>

      {l1 && (
        <InfoBox variant="green">
          <strong>Recommended: {l1.supplier}</strong> — L1 bid of ₹{l1.fin_env_amount?.toLocaleString("en-IN")} with a technical score of {l1.tech_score}/100. This supplier meets the minimum qualification threshold.
        </InfoBox>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3 pb-1.5 border-b border-slate-100">Award details</div>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-600">Award to supplier <span className="text-red-500">*</span></label>
            <select value={selectedId} onChange={e => setSelectedId(parseInt(e.target.value))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-md text-[13px] bg-white">
              {qualified.map(r => (
                <option key={r.id} value={r.id}>
                  {r.supplier} — Score: {r.tech_score}/100 {r.fin_env_amount ? `— ₹${r.fin_env_amount.toLocaleString("en-IN")}` : "(price sealed)"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-600">Awarded amount (₹) <span className="text-red-500">*</span></label>
            <Input value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-600">Contract start date</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-600">Contract duration (months)</label>
            <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={1} />
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[12px] font-medium text-slate-600">Award justification / notes <span className="text-red-500">*</span></label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Provide justification for award decision – this is recorded in the audit trail…" className="text-[13px]" />
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2.5 pb-1.5 border-b border-slate-100">Notifications</div>
        <InfoBox variant="blue">
          On confirmation: the awarded supplier will receive SUP_AWARDED notification; all non-awarded qualified suppliers will receive SUP_NOT_AWARDED; disqualified suppliers will receive SUP_DISQUALIFIED. These are mandatory system notifications and cannot be suppressed.
        </InfoBox>

        <div className="flex gap-3 mt-2">
          <Button onClick={() => { if (!notes.trim()) { alert("Please provide award justification notes."); return; } onConfirm(selectedId, amount, notes); }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 size={13} /> Confirm award & notify suppliers
          </Button>
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
