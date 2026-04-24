"use client";

import { useState } from "react";
import { LayoutTemplate, FileEdit, X, Search, Star, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TEMPLATE_WIZ_DATA, type TemplateWizData } from "@/lib/rfx-data";
import type { EventType, RFXEvent } from "@/lib/rfx-types";

type CreateMode = "template" | "blank";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (template?: TemplateWizData) => void;
  events: RFXEvent[];
  starredEventIds: Set<number>;
}

const TYPE_PILL: Record<EventType, string> = {
  RFI: "bg-indigo-100 text-indigo-700",
  RFP: "bg-sky-100 text-sky-700",
  RFQ: "bg-amber-100 text-amber-700",
};

function EventPicker({ onSelect, onBack, events, starredEventIds }: {
  onSelect: (t: TemplateWizData) => void;
  onBack: () => void;
  events: RFXEvent[];
  starredEventIds: Set<number>;
}) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const starredEvents = events.filter(e => starredEventIds.has(e.id));

  const filtered = starredEvents.filter(e =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.number.toLowerCase().includes(search.toLowerCase())
  );

  function handleUse() {
    const ev = events.find(e => e.id === picked);
    if (!ev) return;
    // Map the starred event to TemplateWizData by matching TEMPLATE_WIZ_DATA by name similarity or just use blank with type
    const match = TEMPLATE_WIZ_DATA.find(t => t.type === ev.type);
    const tpl: TemplateWizData = match
      ? { ...match, name: ev.title, id: ev.id }
      : { id: ev.id, name: ev.title, type: ev.type, category: "", description: "", sections: [], items: [] };
    onSelect(tpl);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back + title */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-[11px] text-slate-300">|</span>
        <span className="text-[14px] font-bold text-slate-900">Select a template</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search starred events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-8 text-[12px]"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-0.5">
        {starredEvents.length === 0 ? (
          <div className="py-10 text-center">
            <Star size={24} className="text-slate-200 mx-auto mb-2" />
            <p className="text-[12px] text-slate-400 font-medium">No starred events yet.</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Star events from the Events list to use them as templates.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[12px] text-slate-400 py-6">No starred events match your search.</p>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-1 py-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Starred</span>
            </div>
            {filtered.map(ev => (
              <button
                key={ev.id}
                onClick={() => setPicked(ev.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                  picked === ev.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                {/* radio */}
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                  picked === ev.id ? "border-primary bg-primary" : "border-slate-300 bg-white"
                )}>
                  {picked === ev.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", TYPE_PILL[ev.type])}>{ev.type}</span>
                    <span className="text-[12px] font-semibold text-slate-900 truncate">{ev.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ev.number}</p>
                </div>

                {picked === ev.id && <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={!picked}
          onClick={handleUse}
          className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Use template
        </button>
      </div>
    </div>
  );
}

export function CreateEventModal({ open, onClose, onConfirm, events, starredEventIds }: Props) {
  const [selected, setSelected] = useState<CreateMode>("blank");
  const [showPicker, setShowPicker] = useState(false);

  if (!open) return null;

  function handleContinue() {
    if (selected === "template") {
      setShowPicker(true);
    } else {
      onConfirm(undefined);
    }
  }

  function handleTemplateSelect(t: TemplateWizData) {
    setShowPicker(false);
    onConfirm(t);
  }

  function handleClose() {
    setShowPicker(false);
    setSelected("blank");
    onClose();
  }

  const OPTIONS: { mode: CreateMode; icon: React.ReactNode; title: string; sub: string }[] = [
    {
      mode: "template",
      icon: <LayoutTemplate size={20} strokeWidth={1.8} />,
      title: "From a template",
      sub: "Select a starred event to use as a starting point",
    },
    {
      mode: "blank",
      icon: <FileEdit size={20} strokeWidth={1.8} />,
      title: "Blank event",
      sub: "Fill in the request from scratch",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className={cn(
        "bg-white rounded-2xl shadow-xl relative flex flex-col transition-all duration-200",
        showPicker ? "w-[520px] h-[540px] p-6" : "w-[420px] p-6"
      )}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X size={15} />
        </button>

        {showPicker ? (
          <EventPicker
            onSelect={handleTemplateSelect}
            onBack={() => setShowPicker(false)}
            events={events}
            starredEventIds={starredEventIds}
          />
        ) : (
          <>
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
                      sel ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300 bg-white"
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
                onClick={handleClose}
                className="px-4 py-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-5 py-2 text-[13px] font-semibold bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
