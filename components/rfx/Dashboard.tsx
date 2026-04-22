"use client";

import { cn } from "@/lib/utils";
import { TypeBadge, StatusBadge } from "./shared";
import type { RFXEvent } from "@/lib/rfx-types";
import {
  TrendingUp, FileText, Users, CheckCircle2, Clock,
  AlertTriangle, ArrowRight, BarChart3, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  events: RFXEvent[];
  onNavigate: (view: "events" | "responses" | "suppliers" | "templates") => void;
}

const KPI_CARDS = [
  { label: "Active Events",       value: "3",   sub: "+1 this week",    icon: <FileText size={18} className="text-sky-500" />,     bg: "bg-sky-50",     ring: "ring-sky-100" },
  { label: "Total Responses",     value: "24",  sub: "Across all open", icon: <Users size={18} className="text-indigo-500" />,   bg: "bg-indigo-50",  ring: "ring-indigo-100" },
  { label: "Under Evaluation",    value: "5",   sub: "Awaiting scores", icon: <Clock size={18} className="text-amber-500" />,    bg: "bg-amber-50",   ring: "ring-amber-100" },
  { label: "Contracts Awarded",   value: "12",  sub: "This fiscal year",icon: <CheckCircle2 size={18} className="text-emerald-500" />, bg: "bg-emerald-50", ring: "ring-emerald-100" },
  { label: "Pending Q&A",         value: "6",   sub: "Needs response",  icon: <AlertTriangle size={18} className="text-red-500" />, bg: "bg-red-50",   ring: "ring-red-100" },
];

const RECENT_ACTIVITY = [
  { time: "2h ago",  text: "GlobeLux Industries submitted response for RFQ-2025-0018", type: "submit" },
  { time: "5h ago",  text: "Financial envelopes opened for RFQ-2025-0018",             type: "open" },
  { time: "1d ago",  text: "RFP-2025-0017 published — 4 suppliers invited",           type: "publish" },
  { time: "2d ago",  text: "Clarification answered for RFQ-2025-0018 Q3",             type: "clarif" },
  { time: "3d ago",  text: "Nova Electricals disqualified — score 65/100",            type: "disq" },
  { time: "4d ago",  text: "New RFI created: EV Charging Infrastructure Survey",      type: "create" },
];

const ACT_COLORS: Record<string, string> = {
  submit:  "bg-sky-100 text-sky-600",
  open:    "bg-amber-100 text-amber-600",
  publish: "bg-indigo-100 text-indigo-600",
  clarif:  "bg-emerald-100 text-emerald-600",
  disq:    "bg-red-100 text-red-600",
  create:  "bg-slate-100 text-slate-500",
};

const SPEND_BARS = [
  { month: "Oct", pct: 62 }, { month: "Nov", pct: 45 }, { month: "Dec", pct: 78 },
  { month: "Jan", pct: 55 }, { month: "Feb", pct: 90 }, { month: "Mar", pct: 38 },
];

export function Dashboard({ events, onNavigate }: DashboardProps) {
  const activeEvents = events.filter(e => !["DRAFT", "AWARDED", "CANCELLED"].includes(e.status));
  const draftEvents  = events.filter(e => e.status === "DRAFT");

  return (
    <div className="p-7 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Welcome back, Priya. Here's what's happening today.</p>
        </div>
        <Button onClick={() => onNavigate("events")} size="sm" className="gap-1.5">
          <FileText size={13} /> Create event
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3.5">
        {KPI_CARDS.map(k => (
          <div key={k.label} className={cn("bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow")}>
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center ring-4", k.bg, k.ring)}>
              {k.icon}
            </div>
            <div>
              <div className="text-[26px] font-bold text-slate-900 leading-none">{k.value}</div>
              <div className="text-[13px] font-medium text-slate-700 mt-1">{k.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Active events + Spend chart */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Active events */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <span className="text-[14px] font-semibold text-slate-900">Active Events</span>
            <button onClick={() => onNavigate("events")} className="text-[12px] text-sky-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {activeEvents.length === 0 && (
              <p className="px-5 py-8 text-center text-[13px] text-slate-400">No active events.</p>
            )}
            {activeEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onNavigate("responses")}>
                <TypeBadge type={ev.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-slate-900 truncate">{ev.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ev.number} · Deadline: {ev.deadline}</div>
                </div>
                <StatusBadge status={ev.status} />
                <div className="text-right flex-shrink-0">
                  <div className="text-[14px] font-bold text-slate-900">{ev.responses}</div>
                  <div className="text-[10px] text-slate-400">responses</div>
                </div>
              </div>
            ))}
          </div>
          {draftEvents.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-[12px] text-slate-400">{draftEvents.length} draft event{draftEvents.length > 1 ? "s" : ""} pending publish</span>
            </div>
          )}
        </div>

        {/* Spend chart */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart3 size={15} className="text-slate-400" />
              <span className="text-[14px] font-semibold text-slate-900">Monthly Procurement Spend</span>
            </div>
            <p className="text-[11px] text-slate-400">Oct 2025 – Mar 2026 · ₹ Lakhs</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-2.5 h-36">
              {SPEND_BARS.map(b => (
                <div key={b.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">{Math.round(b.pct * 1.2)}</span>
                  <div className="w-full rounded-t-md bg-sky-500/20 relative overflow-hidden" style={{ height: `${b.pct}%` }}>
                    <div className="absolute bottom-0 inset-x-0 bg-sky-500 rounded-t-md transition-all" style={{ height: "60%" }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{b.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] text-slate-400">Total this period</div>
                <div className="text-[15px] font-bold text-slate-900">₹ 3.48 Cr</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">vs last period</div>
                <div className="flex items-center gap-1 text-[14px] font-bold text-emerald-600">
                  <TrendingUp size={14} /> +12.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Activity feed + Quick actions */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Activity feed */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <Activity size={15} className="text-slate-400" />
            <span className="text-[14px] font-semibold text-slate-900">Recent Activity</span>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold", ACT_COLORS[a.type])}>
                  {a.type === "submit" ? "S" : a.type === "open" ? "O" : a.type === "publish" ? "P" : a.type === "clarif" ? "Q" : a.type === "disq" ? "D" : "N"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-700 leading-relaxed">{a.text}</p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <span className="text-[14px] font-semibold text-slate-900">Quick Actions</span>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { label: "Create new event",       sub: "RFI, RFP, or RFQ",   action: () => onNavigate("events"),    color: "text-sky-600",     bg: "bg-sky-50" },
              { label: "View open responses",    sub: "5 awaiting evaluation",        action: () => onNavigate("responses"), color: "text-indigo-600",  bg: "bg-indigo-50" },
              { label: "Manage suppliers",       sub: "28 registered suppliers",      action: () => onNavigate("suppliers"), color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Browse templates",       sub: "12 reusable event templates",  action: () => onNavigate("templates"), color: "text-amber-600",   bg: "bg-amber-50" },
            ].map(qa => (
              <button key={qa.label} onClick={qa.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left group">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", qa.bg)}>
                  <ArrowRight size={14} className={qa.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[13px] font-medium", qa.color)}>{qa.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{qa.sub}</div>
                </div>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
