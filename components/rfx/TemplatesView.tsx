"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypeBadge } from "./shared";
import type { EventType } from "@/lib/rfx-types";
import { Search, Plus, Copy, Pencil, Trash2, Clock, FileText, Star, StarOff } from "lucide-react";

interface Template {
  id: number;
  name: string;
  type: EventType;
  category: string;
  description: string;
  sections: number;
  questions: number;
  items: number;
  lastUsed: string;
  usageCount: number;
  starred: boolean;
  createdBy: string;
}

const TEMPLATES: Template[] = [
  { id: 1,  name: "Annual Lighting Contract",      type: "RFQ", category: "Electrical",    description: "BOQ-based quotation for decorative & industrial lighting procurement.",                         sections: 4, questions: 18, items: 12, lastUsed: "2 days ago",  usageCount: 8,  starred: true,  createdBy: "Priya Sharma" },
  { id: 2,  name: "IT Hardware Refresh",           type: "RFQ", category: "Technology",    description: "Standard quotation template for annual IT hardware, peripherals and accessories refresh.",      sections: 3, questions: 10, items: 24, lastUsed: "1 week ago",  usageCount: 5,  starred: true,  createdBy: "Ravi Kumar" },
  { id: 3,  name: "Office Furniture Procurement",  type: "RFP", category: "Furniture",     description: "Proposal request for office furniture covering design, supply and installation.",               sections: 3, questions: 12, items: 8,  lastUsed: "3 weeks ago", usageCount: 3,  starred: false, createdBy: "Priya Sharma" },
  { id: 4,  name: "EV Charging Survey",            type: "RFI", category: "Infrastructure",description: "Market research questionnaire for EV charging infrastructure vendors and technology.",           sections: 2, questions: 15, items: 0,  lastUsed: "1 month ago", usageCount: 2,  starred: false, createdBy: "Anita Rao" },
  { id: 5,  name: "Security Systems RFQ",           type: "RFQ", category: "Security",      description: "BOQ-based quotation for campus security infrastructure including CCTV and access control.",    sections: 5, questions: 22, items: 16, lastUsed: "2 months ago",usageCount: 4,  starred: true,  createdBy: "Priya Sharma" },
  { id: 6,  name: "Civil Works BOQ",               type: "RFQ", category: "Civil",         description: "Standard BOQ quotation for civil construction and renovation works.",                          sections: 4, questions: 14, items: 30, lastUsed: "3 months ago",usageCount: 7,  starred: false, createdBy: "Ravi Kumar" },
  { id: 7,  name: "Cloud Services RFP",            type: "RFP", category: "Technology",    description: "Request for proposals covering cloud hosting, storage, and managed service providers.",        sections: 4, questions: 20, items: 6,  lastUsed: "1 week ago",  usageCount: 3,  starred: false, createdBy: "Anita Rao" },
  { id: 8,  name: "Catering Services RFQ",         type: "RFQ", category: "Facilities",    description: "Quotation template for corporate cafeteria and event catering services.",                       sections: 2, questions: 8,  items: 15, lastUsed: "5 days ago",  usageCount: 6,  starred: false, createdBy: "Priya Sharma" },
  { id: 9,  name: "Vendor Capability Survey",      type: "RFI", category: "General",       description: "Generic market intelligence form to assess new vendor capabilities and certifications.",        sections: 3, questions: 18, items: 0,  lastUsed: "2 weeks ago", usageCount: 9,  starred: true,  createdBy: "Ravi Kumar" },
  { id: 10, name: "Annual Maintenance Contract",   type: "RFQ", category: "Facilities",    description: "Multi-year AMC quotation for electrical, mechanical, and civil maintenance works.",            sections: 5, questions: 25, items: 20, lastUsed: "4 months ago",usageCount: 5,  starred: false, createdBy: "Anita Rao" },
  { id: 11, name: "Printing & Stationery RFQ",     type: "RFQ", category: "Office",        description: "Annual quotation for printing, stationery, and office consumables.",                           sections: 2, questions: 7,  items: 22, lastUsed: "3 weeks ago", usageCount: 4,  starred: false, createdBy: "Priya Sharma" },
  { id: 12, name: "Marketing Agency RFP",          type: "RFP", category: "Marketing",     description: "Full-service agency proposal covering digital, print, and event marketing.",                   sections: 4, questions: 16, items: 5,  lastUsed: "6 weeks ago", usageCount: 2,  starred: false, createdBy: "Ravi Kumar" },
];

const TYPE_FILTER_TABS: Array<"ALL" | EventType> = ["ALL", "RFI", "RFP", "RFQ"];
const CATEGORIES = ["All", "Electrical", "Technology", "Furniture", "Infrastructure", "Security", "Civil", "Facilities", "General", "Office", "Marketing"];

const TYPE_BG: Record<EventType, string> = {
  RFI:     "from-indigo-50 to-white border-indigo-100",
  RFP:     "from-sky-50 to-white border-sky-100",
  RFQ:     "from-amber-50 to-white border-amber-100",
};

export function TemplatesView({ onUseTemplate }: { onUseTemplate: () => void }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | EventType>("ALL");
  const [category, setCategory] = useState("All");
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "ALL" || t.type === typeFilter;
    const matchCat    = category === "All" || t.category === category;
    return matchSearch && matchType && matchCat;
  });

  const starred    = filtered.filter(t => t.starred);
  const unstarred  = filtered.filter(t => !t.starred);

  function toggleStar(id: number) {
    setTemplates(ts => ts.map(t => t.id !== id ? t : { ...t, starred: !t.starred }));
  }

  const counts: Record<"ALL" | EventType, number> = {
    ALL:     templates.length,
    RFI:     templates.filter(t => t.type === "RFI").length,
    RFP:     templates.filter(t => t.type === "RFP").length,
    RFQ:     templates.filter(t => t.type === "RFQ").length,
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900">Templates</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">{templates.length} reusable event templates · Speed up your procurement workflow</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus size={13} /> Create template</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* search */}
        <div className="relative min-w-[240px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-[13px] h-9" />
        </div>
        {/* category */}
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-white text-slate-700">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {/* type tabs */}
        <div className="flex gap-0 border-b border-slate-200 ml-auto">
          {TYPE_FILTER_TABS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3.5 py-2 text-[13px] border-b-2 mb-[-1px] transition-all",
                typeFilter === t ? "text-sky-600 border-sky-500 font-medium" : "text-slate-500 border-transparent hover:text-slate-800"
              )}>
              {t}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-[13px]">No templates match your search.</div>
      )}

      {/* Starred section */}
      {starred.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-[13px] font-semibold text-slate-700">Starred</span>
            <span className="text-[11px] text-slate-400">({starred.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {starred.map(t => <TemplateCard key={t.id} template={t} onUse={onUseTemplate} onToggleStar={toggleStar} />)}
          </div>
        </div>
      )}

      {/* All templates */}
      {unstarred.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={13} className="text-slate-400" />
            <span className="text-[13px] font-semibold text-slate-700">{starred.length > 0 ? "All other templates" : "All templates"}</span>
            <span className="text-[11px] text-slate-400">({unstarred.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {unstarred.map(t => <TemplateCard key={t.id} template={t} onUse={onUseTemplate} onToggleStar={toggleStar} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template: t, onUse, onToggleStar }: {
  template: Template; onUse: () => void; onToggleStar: (id: number) => void;
}) {
  return (
    <div className={cn("bg-gradient-to-b border rounded-xl p-4 hover:shadow-md transition-all group relative", TYPE_BG[t.type])}>
      {/* star button */}
      <button onClick={() => onToggleStar(t.id)}
        className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-amber-400">
        {t.starred ? <Star size={14} className="text-amber-400 fill-amber-400" /> : <StarOff size={14} />}
      </button>

      <div className="flex items-start gap-2.5 mb-2.5">
        <TypeBadge type={t.type} />
        <span className="text-[11px] text-slate-400 mt-0.5">{t.category}</span>
      </div>

      <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5 pr-6">{t.name}</h3>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-3.5 line-clamp-2">{t.description}</p>

      {/* meta chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.sections} sections</span>
        <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.questions} questions</span>
        {t.items > 0 && <span className="text-[11px] bg-white/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{t.items} line items</span>}
      </div>

      <div className="flex items-center justify-between border-t border-white/60 pt-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={10} /> Last used {t.lastUsed}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Used {t.usageCount}× · {t.createdBy}</div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all">
            <Pencil size={12} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:border-red-200 transition-all">
            <Trash2 size={12} />
          </button>
          <Button size="sm" onClick={onUse} className="h-7 text-[11px] gap-1 px-2.5">
            <Copy size={11} /> Use
          </Button>
        </div>
      </div>
    </div>
  );
}
