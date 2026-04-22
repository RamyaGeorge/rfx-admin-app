"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EventType, EventStatus, EnvelopeStatus, ClarifStatus } from "@/lib/rfx-types";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

/* ── Type colours ─────────────────────────────────────────────────── */
export const TYPE_COLORS: Record<EventType, { color: string; bg: string; ring: string }> = {
  RFI:     { color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-200" },
  RFP:     { color: "text-sky-600",    bg: "bg-sky-50",    ring: "ring-sky-200" },
  RFQ:     { color: "text-amber-600",  bg: "bg-amber-50",  ring: "ring-amber-200" },
};

/* ── Type badge ───────────────────────────────────────────────────── */
export function TypeBadge({ type }: { type: EventType }) {
  const c = TYPE_COLORS[type];
  return (
    <span className={cn("inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full", c.bg, c.color)}>
      {type}
    </span>
  );
}

/* ── Status badge ─────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  PUBLISHED: "bg-sky-100 text-sky-700",
  OPEN: "bg-emerald-100 text-emerald-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700",
  AWARDED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
  SUBMITTED: "bg-emerald-100 text-emerald-700",
  WITHDRAWN: "bg-slate-100 text-slate-500",
  DISQUALIFIED: "bg-amber-100 text-amber-700",
  PENDING: "bg-amber-100 text-amber-700",
  ANSWERED: "bg-emerald-100 text-emerald-700",
  INVITED: "bg-indigo-100 text-indigo-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
  PASSED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  SEALED: "bg-amber-100 text-amber-700",
  OPENED: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500";
  return (
    <span className={cn("inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap", cls)}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

/* ── Envelope badge ───────────────────────────────────────────────── */
export function EnvelopeBadge({ label, status }: { label: string; status: EnvelopeStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full gap-1",
      status === "OPENED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
    )}>
      {label}: {status}
    </span>
  );
}

/* ── Info boxes ───────────────────────────────────────────────────── */
type InfoVariant = "blue" | "amber" | "green" | "red" | "gray";

const INFO_STYLES: Record<InfoVariant, { wrap: string; icon: React.ReactNode }> = {
  blue:  { wrap: "bg-blue-50 border border-blue-200 text-blue-900",   icon: <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" /> },
  amber: { wrap: "bg-amber-50 border border-amber-200 text-amber-900", icon: <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /> },
  green: { wrap: "bg-emerald-50 border border-emerald-200 text-emerald-900", icon: <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> },
  red:   { wrap: "bg-red-50 border border-red-200 text-red-900",       icon: <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /> },
  gray:  { wrap: "bg-slate-50 border border-slate-200 text-slate-700", icon: <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" /> },
};

export function InfoBox({ variant, children }: { variant: InfoVariant; children: React.ReactNode }) {
  const s = INFO_STYLES[variant];
  return (
    <div className={cn("flex gap-2.5 rounded-md px-3 py-2.5 text-[12px] leading-relaxed mb-3.5", s.wrap)}>
      {s.icon}
      <div>{children}</div>
    </div>
  );
}

/* ── Score bar ────────────────────────────────────────────────────── */
export function ScoreBar({ value, pass }: { value: number; pass: boolean }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
      <div
        className={cn("h-full rounded-full transition-all", pass ? "bg-emerald-500" : "bg-red-400")}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ── Section label ────────────────────────────────────────────────── */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mt-5 mb-3 pb-1.5 border-b border-slate-100 first:mt-0">
      {children}
    </div>
  );
}

/* ── Toggle row ───────────────────────────────────────────────────── */
export function ToggleRow({
  label, sub, checked, onChange,
}: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-[13px] font-medium text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-9 h-5.5 rounded-full transition-colors flex-shrink-0 focus:outline-none",
          checked ? "bg-sky-500" : "bg-slate-200"
        )}
        style={{ width: 38, height: 22 }}
      >
        <span
          className={cn(
            "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all",
            checked ? "left-[18px]" : "left-[2px]"
          )}
        />
      </button>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────── */
export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
      <div className="text-[22px] font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

/* ── Not applicable block ─────────────────────────────────────────── */
export function NotApplicable({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-md text-slate-400 text-[12px]">
      <Info size={16} className="flex-shrink-0" />
      {children}
    </div>
  );
}
