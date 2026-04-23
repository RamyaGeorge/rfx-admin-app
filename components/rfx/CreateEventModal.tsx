"use client";

import { useState } from "react";
import { LayoutTemplate, FileEdit, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreateMode = "template" | "blank";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const OPTIONS: { mode: CreateMode; icon: React.ReactNode; title: string; sub: string }[] = [
  {
    mode: "template",
    icon: <LayoutTemplate size={20} strokeWidth={1.8} />,
    title: "From a template",
    sub: "Select a template to start a new request",
  },
  {
    mode: "blank",
    icon: <FileEdit size={20} strokeWidth={1.8} />,
    title: "Blank event",
    sub: "Fill in the request from scratch",
  },
];

export function CreateEventModal({ open, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<CreateMode>("blank");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X size={15} />
        </button>
        <h2 className="text-[17px] font-bold text-slate-900 mb-5">
          How would you like to create your RFx?
        </h2>

        <div className="space-y-3 mb-6">
          {OPTIONS.map(({ mode, icon, title, sub }) => {
            const sel = selected === mode;
            return (
              <button
                key={mode}
                onClick={() => setSelected(mode)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                  sel
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  sel ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900">{title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center",
                  sel ? "border-primary bg-primary" : "border-slate-300 bg-white"
                )}>
                  {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            className="px-5 py-2 text-[13px] font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
