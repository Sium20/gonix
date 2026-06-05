"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/Input";

export function UniversitySelect({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; fullName: string | null; type: string; city: string | null }>>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>(defaultValue || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((d) => setUniversities(d.universities || []))
      .catch(() => {});
  }, []);

  const filtered = universities
    .filter((u) => {
      const q = query.toLowerCase();
      return !q || u.name.toLowerCase().includes(q) || (u.fullName?.toLowerCase().includes(q) ?? false);
    })
    .slice(0, 30);

  const selectedUni = universities.find((u) => u.id === selected);

  return (
    <div className="space-y-2 relative">
      <Label>University</Label>
      <input type="hidden" name={name} value={selected} required={required} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm text-left hover:border-fg/30 transition-colors flex items-center justify-between"
      >
        <span className={selectedUni ? "text-fg" : "text-fg-dim"}>
          {selectedUni ? selectedUni.fullName || selectedUni.name : "Search and select your university…"}
        </span>
        <span className="text-fg-dim text-xs">▾</span>
      </button>
      {open ? (
        <div className="absolute z-30 top-full mt-1 w-full rounded-md border border-line bg-bg-soft shadow-soft max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-line">
            <input
              autoFocus
              type="text"
              placeholder="Type to search (BUET, BRAC, NSU, AUST…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-md bg-bg border border-line px-3 text-sm focus:outline-none focus:border-fg/40"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-fg-muted p-4 text-center">No matches</p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelected(u.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-fg/5 border-b border-line/50 last:border-b-0"
                >
                  <p className="text-sm font-medium">{u.name}</p>
                  {u.fullName ? <p className="text-xs text-fg-muted">{u.fullName}</p> : null}
                  <p className="text-[10px] text-fg-dim uppercase tracking-wider mt-0.5">
                    {u.type} {u.city ? `· ${u.city}` : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
