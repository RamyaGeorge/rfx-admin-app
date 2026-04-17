"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Star, MapPin, Phone, Mail,
  Globe, CheckCircle2, XCircle, Clock, Filter,
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  country: string;
  category: string;
  status: "APPROVED" | "PENDING" | "BLACKLISTED";
  rating: number;
  eventsParticipated: number;
  eventsWon: number;
  contact: string;
  email: string;
  website: string;
  tags: string[];
}

const SUPPLIERS: Supplier[] = [
  { id: 1,  name: "ABC Lighting Co.",        country: "IN", category: "Electrical",   status: "APPROVED",    rating: 4.8, eventsParticipated: 12, eventsWon: 4, contact: "+91 98765 43210", email: "contact@abclighting.in",      website: "abclighting.in",      tags: ["ISO 9001", "MSME", "Preferred"] },
  { id: 2,  name: "GlobeLux Industries",     country: "DE", category: "Electrical",   status: "APPROVED",    rating: 4.3, eventsParticipated: 8,  eventsWon: 2, contact: "+49 30 1234567",  email: "info@globelux.de",            website: "globelux.de",         tags: ["ISO 9001", "CE Certified"] },
  { id: 3,  name: "Nova Electricals Pvt Ltd",country: "IN", category: "Electrical",   status: "PENDING",     rating: 3.5, eventsParticipated: 3,  eventsWon: 0, contact: "+91 99887 76655", email: "nova@electricals.in",         website: "novaelectricals.in",  tags: ["New Vendor"] },
  { id: 4,  name: "LightWave Solutions",     country: "SG", category: "Technology",   status: "APPROVED",    rating: 4.1, eventsParticipated: 6,  eventsWon: 1, contact: "+65 6123 4567",   email: "hello@lightwave.sg",          website: "lightwave.sg",        tags: ["ISO 27001"] },
  { id: 5,  name: "BrightPath GmbH",         country: "DE", category: "Electrical",   status: "APPROVED",    rating: 4.6, eventsParticipated: 10, eventsWon: 3, contact: "+49 89 9876543",  email: "sales@brightpath.de",         website: "brightpath.de",       tags: ["ISO 9001", "CE Certified", "Preferred"] },
  { id: 6,  name: "Zenith Electricals",      country: "IN", category: "Electrical",   status: "APPROVED",    rating: 4.0, eventsParticipated: 5,  eventsWon: 1, contact: "+91 80 2345678",  email: "zenith@electricals.com",      website: "zenithelectricals.com", tags: ["MSME"] },
  { id: 7,  name: "Voltex Solutions",        country: "US", category: "Technology",   status: "PENDING",     rating: 3.8, eventsParticipated: 2,  eventsWon: 0, contact: "+1 415 5551234",  email: "procurement@voltex.us",       website: "voltex.us",           tags: ["New Vendor"] },
  { id: 8,  name: "IndoLux Pvt Ltd",         country: "IN", category: "Furniture",    status: "APPROVED",    rating: 4.2, eventsParticipated: 7,  eventsWon: 2, contact: "+91 22 6789012",  email: "indolux@pvt.in",              website: "indolux.in",          tags: ["ISO 9001", "MSME"] },
  { id: 9,  name: "EuroLight AG",            country: "CH", category: "Electrical",   status: "APPROVED",    rating: 4.7, eventsParticipated: 9,  eventsWon: 4, contact: "+41 44 1234567",  email: "info@eurolight.ch",           website: "eurolight.ch",        tags: ["ISO 9001", "ISO 14001", "Preferred"] },
  { id: 10, name: "TechnoFab Industries",    country: "IN", category: "Manufacturing",status: "BLACKLISTED", rating: 2.1, eventsParticipated: 4,  eventsWon: 0, contact: "+91 44 3456789",  email: "technofab@industries.in",     website: "technofab.in",        tags: ["Blacklisted"] },
  { id: 11, name: "Luminary Corp",           country: "SG", category: "Electrical",   status: "APPROVED",    rating: 4.4, eventsParticipated: 11, eventsWon: 3, contact: "+65 6987 6543",   email: "corp@luminary.sg",            website: "luminary.sg",         tags: ["ISO 9001"] },
  { id: 12, name: "AlphaVolt GmbH",          country: "DE", category: "Electrical",   status: "APPROVED",    rating: 4.5, eventsParticipated: 8,  eventsWon: 2, contact: "+49 40 8765432",  email: "info@alphavolt.de",           website: "alphavolt.de",        tags: ["ISO 9001", "CE Certified"] },
];

const STATUS_STYLES: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  APPROVED:    { cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} />, label: "Approved" },
  PENDING:     { cls: "bg-amber-100 text-amber-700",     icon: <Clock size={11} />,        label: "Pending" },
  BLACKLISTED: { cls: "bg-red-100 text-red-700",         icon: <XCircle size={11} />,      label: "Blacklisted" },
};

const CATEGORIES = ["All", "Electrical", "Technology", "Furniture", "Manufacturing"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      ))}
      <span className="text-[11px] text-slate-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

export function SuppliersView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "BLACKLISTED">("ALL");

  const filtered = SUPPLIERS.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || s.category === category;
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const counts = {
    ALL: SUPPLIERS.length,
    APPROVED:    SUPPLIERS.filter(s => s.status === "APPROVED").length,
    PENDING:     SUPPLIERS.filter(s => s.status === "PENDING").length,
    BLACKLISTED: SUPPLIERS.filter(s => s.status === "BLACKLISTED").length,
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900">Suppliers</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">{SUPPLIERS.length} registered suppliers across all categories</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus size={13} /> Add supplier</Button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search suppliers…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-[13px] h-9" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-md text-[13px] bg-white text-slate-700">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {/* status tabs */}
        <div className="flex gap-0 border border-slate-200 rounded-lg overflow-hidden ml-auto">
          {(["ALL","APPROVED","PENDING","BLACKLISTED"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 text-[12px] font-medium transition-all",
                statusFilter === s ? "bg-sky-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
              )}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Suppliers",  value: counts.ALL,         color: "text-slate-900",    bg: "bg-slate-50" },
          { label: "Approved",         value: counts.APPROVED,    color: "text-emerald-600",  bg: "bg-emerald-50" },
          { label: "Pending Review",   value: counts.PENDING,     color: "text-amber-600",    bg: "bg-amber-50" },
          { label: "Blacklisted",      value: counts.BLACKLISTED, color: "text-red-600",      bg: "bg-red-50" },
        ].map(c => (
          <div key={c.label} className={cn("rounded-xl p-4 border border-slate-200 bg-white")}>
            <div className={cn("text-[24px] font-bold", c.color)}>{c.value}</div>
            <div className="text-[12px] text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Supplier", "Category", "Country", "Status", "Rating", "Events", "Tags", ""].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px] text-slate-400">No suppliers match your search.</td></tr>
            )}
            {filtered.map(s => {
              const st = STATUS_STYLES[s.status];
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-slate-900">{s.name}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Mail size={10} /> {s.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-600">{s.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[12px] text-slate-600">
                      <MapPin size={11} className="text-slate-400" /> {s.country}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full", st.cls)}>
                      {st.icon} {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StarRating rating={s.rating} /></td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] text-slate-700 font-medium">{s.eventsParticipated} participated</div>
                    <div className="text-[11px] text-slate-400">{s.eventsWon} won</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="h-7 text-[11px]">View</Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px]">Invite</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
