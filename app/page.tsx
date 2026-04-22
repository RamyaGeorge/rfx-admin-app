"use client";

import { useState } from "react";
import { Sidebar } from "@/components/rfx/Sidebar";
import { Dashboard } from "@/components/rfx/Dashboard";
import { EventsList } from "@/components/rfx/EventsList";
import { Wizard } from "@/components/rfx/Wizard";
import { ResponsesView } from "@/components/rfx/ResponsesView";
import { SuppliersView } from "@/components/rfx/SuppliersView";
import { TemplatesView } from "@/components/rfx/TemplatesView";
import {
  EVENTS_LIST as INITIAL_EVENTS,
  ACTIVE_EVENT as INITIAL_ACTIVE,
  RESPONSES as INITIAL_RESPONSES,
  CLARIFICATIONS as INITIAL_CLARIFS,
  RESPONSES_BY_EVENT,
  CLARIFICATIONS_BY_EVENT,
  CRITERIA,
} from "@/lib/rfx-data";
import type {
  AppView, RFXEvent, ActiveEvent, SupplierResponse, Clarification, WizState,
} from "@/lib/rfx-types";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOP_LABELS: Partial<Record<AppView, string>> = {
  dashboard: "Dashboard",
  events:    "Events",
  wizard:    "Create event",
  responses: "",          // set dynamically
  eval:      "Evaluate",
  clarif:    "Q&A / Clarifications",
  award:     "Award contract",
  published: "Published",
  suppliers: "Suppliers",
  templates: "Templates",
  reports:   "Reports",
  settings:  "Settings",
};

function toActiveEvent(ev: RFXEvent): ActiveEvent {
  if (ev.id === INITIAL_ACTIVE.id) return { ...INITIAL_ACTIVE };
  return {
    id: ev.id,
    number: ev.number,
    type: ev.type,
    title: ev.title,
    status: ev.status,
    deadline: ev.deadline,
    two_envelope: false,
    tech_opening: "—",
    fin_opening: "—",
    tech_phase: "SEALED",
    fin_phase: "SEALED",
    min_qual_score: 70,
  };
}

export default function Home() {
  const [view, setView]     = useState<AppView>("events");
  const [events, setEvents] = useState<RFXEvent[]>(INITIAL_EVENTS);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent>({ ...INITIAL_ACTIVE });
  const [responses,   setResponses]   = useState<SupplierResponse[]>(INITIAL_RESPONSES.map(r => ({ ...r })));
  const [clarifications, setClarifications] = useState<Clarification[]>(INITIAL_CLARIFS.map(c => ({ ...c })));
  const [publishedType,  setPublishedType]  = useState("");
  const [publishedCount, setPublishedCount] = useState(0);

  function navigate(v: AppView) { setView(v); }

  function switchEvent(ev: RFXEvent) {
    setActiveEvent(toActiveEvent(ev));
    setResponses((RESPONSES_BY_EVENT[ev.id] ?? []).map(r => ({ ...r })));
    setClarifications((CLARIFICATIONS_BY_EVENT[ev.id] ?? []).map(c => ({ ...c })));
  }

  function handlePublish(wiz: WizState) {
    setEvents(ev => [{
      id: Date.now(),
      number: `${wiz.type}-2025-0019`,
      type: wiz.type,
      title: "Annual Decorative Lighting Contract",
      status: "PUBLISHED",
      deadline: "30 Sep 2025",
      responses: 0,
      qualified: 0,
    }, ...ev]);
    setPublishedType(wiz.type);
    setPublishedCount(wiz.participants.length);
    setView("published");
  }

  function handleUpdateEvent(patch: Partial<ActiveEvent>) {
    setActiveEvent(prev => ({ ...prev, ...patch }));
    if (patch.status) {
      setEvents(ev => ev.map(e => e.id === activeEvent.id ? { ...e, status: patch.status! } : e));
    }
  }

  /* breadcrumb label */
  const pageLabel = view === "responses" ? activeEvent.number : (TOP_LABELS[view] ?? view);

  /* views that live under Events in the breadcrumb */
  const underEvents = ["wizard", "responses", "eval", "award", "clarif"].includes(view);
  /* views that live under Responses in the breadcrumb */
  const underResponses = ["eval", "award"].includes(view);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar activeView={view} onNavigate={navigate} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="h-[54px] bg-white border-b border-slate-200 flex items-center px-7 flex-shrink-0 gap-1.5">
          <nav className="flex items-center gap-1.5 text-[13px] text-slate-500">
            {underEvents && (
              <>
                <button onClick={() => navigate("events")} className="hover:text-sky-600 transition-colors">Events</button>
                <span className="text-slate-300">›</span>
              </>
            )}
            {underResponses && (
              <>
                <button onClick={() => navigate("responses")} className="hover:text-sky-600 transition-colors">{activeEvent.number}</button>
                <span className="text-slate-300">›</span>
              </>
            )}
            <strong className="text-slate-800 font-medium">{pageLabel}</strong>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">

          {view === "dashboard" && (
            <Dashboard events={events} onNavigate={navigate} />
          )}

          {view === "events" && (
            <EventsList
              events={events}
              onCreateEvent={() => navigate("wizard")}
              onOpenEvent={(id) => {
                const ev = events.find(e => e.id === id);
                if (ev) switchEvent(ev);
                navigate("responses");
              }}
              onEditDraft={() => navigate("wizard")}
            />
          )}

          {view === "wizard" && (
            <div className="h-full">
              <Wizard onNavigate={navigate} onPublish={handlePublish} />
            </div>
          )}

          {(view === "responses" || view === "eval" || view === "award") && (
            <ResponsesView
              event={activeEvent}
              events={events}
              responses={responses}
              clarifications={clarifications}
              criteria={CRITERIA}
              onNavigate={navigate}
              onUpdateEvent={handleUpdateEvent}
              onSelectEvent={switchEvent}
              onUpdateResponses={setResponses}
              onUpdateClarifications={setClarifications}
            />
          )}

          {view === "suppliers" && <SuppliersView />}

          {view === "templates" && (
            <TemplatesView onUseTemplate={() => navigate("wizard")} />
          )}

          {view === "published" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-[20px] font-bold text-slate-900 mb-1.5">Event published!</h2>
                <p className="text-[14px] text-slate-500 mb-1">{publishedType}-2025-0019 created successfully.</p>
                <p className="text-[13px] text-slate-400 mb-6">{publishedCount} suppliers have been notified.</p>
                <div className="flex gap-2.5 justify-center">
                  <Button onClick={() => navigate("events")}>Back to events</Button>
                  <Button variant="outline" onClick={() => navigate("wizard")}>Create another event</Button>
                </div>
              </div>
            </div>
          )}

          {/* Stub pages for Reports / Settings */}
          {(view === "reports" || view === "settings") && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[14px] font-medium text-slate-600 capitalize">{view}</p>
                <p className="text-[13px] text-slate-400 mt-1">Available in full build.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("dashboard")}>
                  Back to dashboard
                </Button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
