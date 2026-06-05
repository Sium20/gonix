"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";

type Initial = { q: string; role: string; universityId: string; departmentId: string; batchYear: string };

export function SearchFilters({
  universities,
  initial,
}: {
  universities: Array<{ id: string; name: string }>;
  initial: Initial;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const [role, setRole] = useState(initial.role);
  const [universityId, setUniversityId] = useState(initial.universityId);
  const [departmentId, setDepartmentId] = useState(initial.departmentId);
  const [batchYear, setBatchYear] = useState(initial.batchYear);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (universityId) {
      fetch(`/api/departments?universityId=${universityId}`)
        .then((r) => r.json())
        .then((d) => setDepartments(d.departments || []))
        .catch(() => {});
    } else {
      setDepartments([]);
      setDepartmentId("");
    }
  }, [universityId]);

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (universityId) params.set("universityId", universityId);
    if (departmentId) params.set("departmentId", departmentId);
    if (batchYear) params.set("batchYear", batchYear);
    router.push(`/search?${params.toString()}`);
  }

  function clear() {
    setQ(""); setRole(""); setUniversityId(""); setDepartmentId(""); setBatchYear("");
    router.push("/search");
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={apply} className="space-y-5 sticky top-20">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-3">Filters</h3>
      </div>

      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-dim" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, bio, company…" className="pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="alumni">Alumni</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>University</Label>
        <Select value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
          <option value="">All</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </div>

      {universityId ? (
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Batch year</Label>
        <Select value={batchYear} onChange={(e) => setBatchYear(e.target.value)}>
          <option value="">All</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
    </form>
  );
}
