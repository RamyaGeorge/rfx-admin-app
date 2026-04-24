"use client";

import { cn } from "@/lib/utils";
import type { AppView } from "@/lib/rfx-types";
import { Calendar, FileText, ArrowRight, LayoutDashboard, Users, LayoutTemplate, Settings, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  view: AppView;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} />, view: "dashboard" },
  { id: "events", label: "Events", icon: <Calendar size={15} />, badge: 3, view: "events" },
  { id: "responses", label: "Responses", icon: <FileText size={15} />, badge: 5, view: "responses" },
  // { id: "suppliers",  label: "Suppliers",  icon: <Users size={15} />,           view: "suppliers" },
  { id: "templates", label: "Templates", icon: <LayoutTemplate size={15} />, view: "templates" },
  // { id: "reports",    label: "Reports",    icon: <BarChart3 size={15} />,       view: "reports" },
  // { id: "settings",   label: "Settings",   icon: <Settings size={15} />,        view: "settings" },
];

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const isActive = (item: NavItem) => {
    if (item.id === "dashboard") return activeView === "dashboard";
    if (item.id === "events") return ["events", "event", "event-preview", "wizard", "published"].includes(activeView);
    if (item.id === "responses") return ["responses", "eval", "clarif", "award"].includes(activeView);
    if (item.id === "suppliers") return activeView === "suppliers";
    if (item.id === "templates") return activeView === "templates";
    if (item.id === "reports") return activeView === "reports";
    if (item.id === "settings") return activeView === "settings";
    return false;
  };

  return (
    <aside className="flex flex-col h-full bg-[#1a1a2e] w-60 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-[22px] border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-sky-500 flex items-center justify-center flex-shrink-0">
            <ArrowRight size={16} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white tracking-[-0.2px]">ProcureFlow</div>
            <div className="text-[11px] text-white/45 mt-0.5">Procurement Portal</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          <div className="px-5 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase">Main</div>
          {NAV_ITEMS.filter(i => !["reports", "settings"].includes(i.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-[13px] transition-all cursor-pointer",
                "text-white/55 hover:bg-white/[0.08] hover:text-white/85",
                isActive(item) && "bg-sky-500/[0.18] text-sky-300 font-medium"
              )}
              style={{ width: "calc(100% - 12px)" }}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="mx-4 my-2 border-t border-white/[0.06]" />
          {/* <div className="px-5 py-2 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase">System</div> */}
          {NAV_ITEMS.filter(i => ["reports", "settings"].includes(i.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-[13px] transition-all cursor-pointer",
                "text-white/55 hover:bg-white/[0.08] hover:text-white/85",
                isActive(item) && "bg-sky-500/[0.18] text-sky-300 font-medium"
              )}
              style={{ width: "calc(100% - 12px)" }}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            PS
          </div>
          <div>
            <div className="text-[13px] font-medium text-white">Priya Sharma</div>
            <div className="text-[11px] text-white/40">Procurement Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
