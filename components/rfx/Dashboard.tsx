"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import type { RFXEvent } from "@/lib/rfx-types";
import {
  TrendingUp, TrendingDown, FileText, Users, CheckCircle2, Clock,
  AlertTriangle, ArrowRight, BarChart3, Activity, Zap, Target,
  ShieldCheck, Package, RefreshCw, ChevronRight, Flame, CircleDot,
  CalendarClock, Inbox, Award, BadgePercent, Layers,
} from "lucide-react";

interface DashboardProps {
  events: RFXEvent[];
  onNavigate: (view: "events" | "responses" | "suppliers" | "templates") => void;
}

/* ── Mock analytics data ─────────────────────────────────────────────────── */

const SPEND_TREND = [
  { month: "Oct", value: 74,  label: "₹74L" },
  { month: "Nov", value: 54,  label: "₹54L" },
  { month: "Dec", value: 93,  label: "₹93L" },
  { month: "Jan", value: 66,  label: "₹66L" },
  { month: "Feb", value: 108, label: "₹108L" },
  { month: "Mar", value: 46,  label: "₹46L" },
];

const MAX_SPEND = Math.max(...SPEND_TREND.map(s => s.value));

const CATEGORY_SPLIT = [
  { label: "Electrical & Instrumentation", pct: 34, color: "bg-amber-500" },
  { label: "IT & Software",                pct: 22, color: "bg-sky-500" },
  { label: "Facility Management",          pct: 18, color: "bg-indigo-500" },
  { label: "Construction & Civil",         pct: 14, color: "bg-emerald-500" },
  { label: "Others",                       pct: 12, color: "bg-slate-300" },
];

const RECENT_ACTIVITY = [
  { time: "2h ago",  text: "GlobeLux Industries submitted response for RFQ-2025-0018",  type: "submit",  icon: Inbox },
  { time: "5h ago",  text: "Financial envelopes opened — 3 bids revealed",              type: "open",    icon: Package },
  { time: "8h ago",  text: "Clarification Q3 answered for RFQ-2025-0018",              type: "clarif",  icon: RefreshCw },
  { time: "1d ago",  text: "RFP-2025-0017 published — 4 suppliers notified",           type: "publish", icon: Zap },
  { time: "2d ago",  text: "Nova Electricals disqualified — tech score 65/100",        type: "disq",    icon: AlertTriangle },
  { time: "2d ago",  text: "RFQ-DRAFT-001 IT Hardware Refresh created",                type: "create",  icon: FileText },
  { time: "3d ago",  text: "Annual Lighting Contract awarded to Stellar Luminex",      type: "award",   icon: Award },
  { time: "4d ago",  text: "EV Charging RFI — 3 vendor responses received",           type: "submit",  icon: Inbox },
];

const ACT_STYLE: Record<string, { icon: string; bg: string }> = {
  submit:  { icon: "text-sky-500",     bg: "bg-sky-50" },
  open:    { icon: "text-amber-500",   bg: "bg-amber-50" },
  publish: { icon: "text-indigo-500",  bg: "bg-indigo-50" },
  clarif:  { icon: "text-teal-500",    bg: "bg-teal-50" },
  disq:    { icon: "text-red-500",     bg: "bg-red-50" },
  create:  { icon: "text-slate-400",   bg: "bg-slate-50" },
  award:   { icon: "text-emerald-500", bg: "bg-emerald-50" },
};

const SUPPLIER_PERF = [
  { name: "Stellar Luminex",     score: 94, events: 4, status: "Preferred" },
  { name: "GlobeLux Industries", score: 87, events: 3, status: "Approved" },
  { name: "FurniWorld Pvt Ltd",  score: 82, events: 2, status: "Approved" },
  { name: "OfficeZone Solutions",score: 71, events: 2, status: "Approved" },
  { name: "Nova Electricals",    score: 58, events: 1, status: "Watchlist" },
];

const DEADLINES = [
  { title: "Office Furniture Procurement – HQ", number: "RFP-2025-0017", deadline: "20 Oct 2025", daysLeft: 3,  type: "RFP" as const, urgent: true },
  { title: "Market Survey: EV Charging",         number: "RFI-2025-0016", deadline: "15 Oct 2025", daysLeft: 7,  type: "RFI" as const, urgent: false },
  { title: "IT Hardware & Peripherals Refresh",  number: "RFQ-DRAFT-001", deadline: "TBD",         daysLeft: null, type: "RFQ" as const, urgent: false },
];

const EVAL_PIPELINE = [
  { stage: "Submitted",       count: 7,  color: "bg-slate-400" },
  { stage: "Tech Eval",       count: 5,  color: "bg-sky-500" },
  { stage: "Fin Eval",        count: 3,  color: "bg-amber-500" },
  { stage: "Negotiation",     count: 1,  color: "bg-indigo-500" },
  { stage: "Awarded",         count: 12, color: "bg-emerald-500" },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */

function KpiCard({ label, value, sub, icon, trend, trendUp, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode;
  trend?: string; trendUp?: boolean; accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:border-slate-300 transition-all group">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent)}>
          {icon}
        </div>
        {trend && (
          <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
            trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-[30px] font-bold text-slate-900 leading-none tracking-tight">{value}</div>
        <div className="text-[13px] font-semibold text-slate-700 mt-1.5">{label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, action, onAction }: {
  title: string; sub?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div>
        <div className="text-[14px] font-bold text-slate-900">{title}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
      {action && onAction && (
        <button onClick={onAction} className="flex items-center gap-1 text-[12px] text-primary font-medium hover:underline">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────────── */

export function Dashboard({ events, onNavigate }: DashboardProps) {
  const [spendHover, setSpendHover] = useState<number | null>(null);

  const activeEvents       = events.filter(e => !["DRAFT", "AWARDED", "CANCELLED"].includes(e.status));
  const draftCount         = events.filter(e => e.status === "DRAFT").length;
  const underEvalCount     = events.filter(e => e.status === "UNDER_EVALUATION").length;
  const totalResponses     = events.reduce((n, e) => n + e.responses, 0);
  const totalQualified     = events.reduce((n, e) => n + e.qualified, 0);
  const qualRate           = totalResponses > 0 ? Math.round((totalQualified / totalResponses) * 100) : 0;

  const KPI_CARDS = [
    {
      label: "Active Events",     value: String(activeEvents.length),
      sub: `${draftCount} draft${draftCount !== 1 ? "s" : ""} pending`,
      icon: <Layers size={18} className="text-sky-600" />,
      accent: "bg-sky-50", trend: "+1 this week", trendUp: true,
    },
    {
      label: "Total Responses",   value: String(totalResponses),
      sub: "Across all open events",
      icon: <Inbox size={18} className="text-indigo-600" />,
      accent: "bg-indigo-50", trend: "+4 today", trendUp: true,
    },
    {
      label: "Qualification Rate", value: `${qualRate}%`,
      sub: `${totalQualified} of ${totalResponses} qualified`,
      icon: <ShieldCheck size={18} className="text-emerald-600" />,
      accent: "bg-emerald-50", trend: "+3%", trendUp: true,
    },
    {
      label: "Under Evaluation",  value: String(underEvalCount),
      sub: "Awaiting final scores",
      icon: <Clock size={18} className="text-amber-600" />,
      accent: "bg-amber-50", trend: undefined, trendUp: undefined,
    },
    {
      label: "Contracts Awarded", value: "12",
      sub: "This fiscal year",
      icon: <CheckCircle2 size={18} className="text-teal-600" />,
      accent: "bg-teal-50", trend: "₹3.48 Cr", trendUp: true,
    },
    {
      label: "Pending Q&A",       value: "6",
      sub: "Needs buyer response",
      icon: <AlertTriangle size={18} className="text-red-500" />,
      accent: "bg-red-50", trend: "2 urgent", trendUp: false,
    },
  ];

  return (
    <div className="p-7 space-y-5 bg-[#f5f7fa] min-h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Procurement Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Welcome back, Priya · FY 2025–26 · Last updated just now</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            <CircleDot size={11} className="text-emerald-500" /> Live
          </div>
          <button
            onClick={() => onNavigate("events")}
            className="flex items-center gap-1.5 text-[13px] font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/85 transition-colors"
          >
            <FileText size={13} /> Create event
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-6 gap-3.5">
        {KPI_CARDS.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* ── Row 2: Spend chart + Evaluation pipeline + Deadlines ── */}
      <div className="grid grid-cols-[1fr_220px_240px] gap-4">

        {/* Spend Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader
            title="Monthly Procurement Spend"
            sub="Oct 2025 – Mar 2026 · ₹ Lakhs"
          />
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-end gap-3 h-36 mb-3">
              {SPEND_TREND.map((b, i) => {
                const heightPct = Math.round((b.value / MAX_SPEND) * 100);
                const isHovered = spendHover === i;
                return (
                  <div
                    key={b.month}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
                    onMouseEnter={() => setSpendHover(i)}
                    onMouseLeave={() => setSpendHover(null)}
                  >
                    {isHovered && (
                      <span className="text-[10px] font-bold text-primary">{b.label}</span>
                    )}
                    {!isHovered && (
                      <span className="text-[10px] text-slate-300 font-medium">{b.label}</span>
                    )}
                    <div className="w-full flex items-end" style={{ height: "88px" }}>
                      <div
                        className={cn("w-full rounded-t-lg transition-all duration-200", isHovered ? "bg-primary" : "bg-primary/20")}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px] font-medium", isHovered ? "text-primary" : "text-slate-400")}>{b.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total period</div>
                <div className="text-[16px] font-bold text-slate-900 mt-0.5">₹4.41 Cr</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">vs last period</div>
                <div className="flex items-center gap-1 text-[15px] font-bold text-emerald-600 mt-0.5">
                  <TrendingUp size={13} /> +12.4%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg / month</div>
                <div className="text-[16px] font-bold text-slate-900 mt-0.5">₹73.5L</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Eval Pipeline" sub="Current bids by stage" />
          <div className="px-5 py-4 space-y-3">
            {EVAL_PIPELINE.map(stage => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-slate-600 font-medium">{stage.stage}</span>
                  <span className="text-[12px] font-bold text-slate-900">{stage.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", stage.color)}
                    style={{ width: `${Math.min(100, (stage.count / 15) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Target size={11} /> 28 total bids in system
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Upcoming Deadlines" sub="Next 30 days" />
          <div className="divide-y divide-slate-50">
            {DEADLINES.map((d, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  d.urgent ? "bg-red-50" : "bg-slate-50"
                )}>
                  <CalendarClock size={14} className={d.urgent ? "text-red-500" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 truncate leading-snug">{d.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.number}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {d.daysLeft !== null ? (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        d.daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {d.daysLeft}d left
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">No deadline set</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Active Events + Category Split + Supplier Perf ── */}
      <div className="grid grid-cols-[1fr_220px_260px] gap-4">

        {/* Active Events Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader
            title="Active Events"
            sub={`${activeEvents.length} live events · ${draftCount} drafts`}
            action="View all"
            onAction={() => onNavigate("events")}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Event", "Type", "Deadline", "Responses", "Qualified", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeEvents.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-slate-400">No active events</td></tr>
                )}
                {activeEvents.map(ev => (
                  <tr key={ev.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => onNavigate("responses")}
                  >
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[220px]">{ev.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ev.number}</div>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={ev.type} /></td>
                    <td className="px-4 py-3 text-[12px] text-slate-500">{ev.deadline}</td>
                    <td className="px-4 py-3 text-[14px] font-bold text-slate-900">{ev.responses}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[13px] font-bold", ev.qualified > 0 ? "text-emerald-600" : "text-slate-400")}>{ev.qualified}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {draftCount > 0 && (
            <div className="px-5 py-2.5 border-t border-slate-100 bg-amber-50/50 flex items-center gap-2">
              <Flame size={12} className="text-amber-500" />
              <span className="text-[11px] text-amber-700 font-medium">{draftCount} draft event{draftCount > 1 ? "s" : ""} ready to publish</span>
              <button onClick={() => onNavigate("events")} className="ml-auto text-[11px] text-amber-600 font-semibold hover:underline">Review →</button>
            </div>
          )}
        </div>

        {/* Category Split */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Spend by Category" sub="Current FY" />
          <div className="px-5 py-4 space-y-3">
            {CATEGORY_SPLIT.map(c => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-600 truncate flex-1 mr-2">{c.label}</span>
                  <span className="text-[11px] font-bold text-slate-900 flex-shrink-0">{c.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", c.color)} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <BarChart3 size={11} /> ₹4.41 Cr total this FY
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader
            title="Supplier Performance"
            sub="Top 5 by score"
            action="All suppliers"
            onAction={() => onNavigate("suppliers")}
          />
          <div className="divide-y divide-slate-50">
            {SUPPLIER_PERF.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                  i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-slate-800 truncate">{s.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", s.score >= 80 ? "bg-emerald-500" : s.score >= 65 ? "bg-amber-500" : "bg-red-400")}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 flex-shrink-0">{s.score}</span>
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0",
                  s.status === "Preferred"  ? "bg-emerald-100 text-emerald-700" :
                  s.status === "Approved"   ? "bg-sky-100 text-sky-700" :
                  "bg-red-100 text-red-600"
                )}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Activity Feed + Quick Stats + Quick Actions ── */}
      <div className="grid grid-cols-[1fr_220px_220px] gap-4">

        {/* Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader
            title="Activity Feed"
            sub="Real-time procurement events"
          />
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              const style = ACT_STYLE[a.type] ?? { icon: "text-slate-400", bg: "bg-slate-50" };
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", style.bg)}>
                    <Icon size={13} className={style.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 leading-relaxed">{a.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5 whitespace-nowrap">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Health */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Process Health" sub="Compliance & SLA" />
          <div className="px-5 py-4 space-y-4">
            {[
              { label: "On-time responses",  value: "87%", icon: <CheckCircle2 size={14} className="text-emerald-500" />, color: "text-emerald-600" },
              { label: "SLA compliance",     value: "92%", icon: <ShieldCheck  size={14} className="text-sky-500" />,     color: "text-sky-600" },
              { label: "Q&A response time",  value: "1.4d", icon: <RefreshCw   size={14} className="text-indigo-500" />, color: "text-indigo-600" },
              { label: "Avg eval duration",  value: "8.2d", icon: <Clock       size={14} className="text-amber-500" />,  color: "text-amber-600" },
              { label: "Supplier yield",     value: `${qualRate}%`, icon: <BadgePercent size={14} className="text-teal-500" />, color: "text-teal-600" },
              { label: "Savings achieved",   value: "₹18L", icon: <TrendingUp  size={14} className="text-emerald-500" />, color: "text-emerald-600" },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-slate-600">
                  {m.icon} {m.label}
                </div>
                <span className={cn("text-[13px] font-bold", m.color)}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <SectionHeader title="Quick Actions" />
          <div className="p-4 space-y-2">
            {[
              { label: "Create new event",     sub: "RFI, RFP, or RFQ",          action: () => onNavigate("events"),    icon: <FileText size={15} />,    color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100" },
              { label: "View responses",       sub: `${totalResponses} awaiting`, action: () => onNavigate("responses"), icon: <Inbox size={15} />,       color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
              { label: "Manage suppliers",     sub: "28 registered",              action: () => onNavigate("suppliers"), icon: <Users size={15} />,       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "Browse templates",     sub: "12 reusable templates",      action: () => onNavigate("templates"), icon: <Layers size={15} />,      color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
            ].map(qa => (
              <button key={qa.label} onClick={qa.action}
                className={cn("w-full flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-all text-left group", qa.border, qa.bg)}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-sm", qa.color)}>
                  {qa.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[12px] font-bold", qa.color)}>{qa.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{qa.sub}</div>
                </div>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-primary/10 to-sky-100 border border-primary/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">AI Insight</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                RFP-2025-0017 deadline is in <strong>3 days</strong> with only 2 responses. Consider sending a reminder to pending suppliers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
