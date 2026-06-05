"use client";

import { useEffect, useState } from "react";
import { Label, Select } from "@/components/ui/Input";
import { UniversitySelect } from "./UniversitySelect";

export function DepartmentSelect({ universityId, name, defaultValue }: { universityId: string; name: string; defaultValue?: string }) {
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!universityId) {
      setDepartments([]);
      return;
    }
    fetch(`/api/departments?universityId=${universityId}`)
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => {});
  }, [universityId]);

  if (!universityId) return null;

  return (
    <div className="space-y-2">
      <Label>Department</Label>
      <Select name={name} defaultValue={defaultValue || ""} required>
        <option value="">Select department</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </Select>
    </div>
  );
}

export function UniversityAndDeptFields({ defaultUniversity, defaultDepartment }: { defaultUniversity?: string; defaultDepartment?: string }) {
  const [universityId, setUniversityId] = useState(defaultUniversity || "");

  return (
    <>
      <div className="space-y-2">
        <UniversitySelect
          name="universityId"
          defaultValue={defaultUniversity}
          required
        />
        <input type="hidden" name="_universityIdWatcher" value={universityId} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Confirm University</label>
        <select
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          className="h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm"
        >
          <option value="">— pick to load departments —</option>
        </select>
        <p className="text-xs text-fg-dim">This is a workaround to load departments. Use the search above to pick, then this confirms.</p>
      </div>
    </>
  );
}
