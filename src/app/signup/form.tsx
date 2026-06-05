"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Check, AlertCircle, GraduationCap, Briefcase, Award, Eye, EyeOff, Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, FieldError, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { unifiedSignup } from "./actions";

type Role = "student" | "teacher" | "alumni";

const ROLE_META: Record<Role, { icon: any; label: string; idLabel: string; idHint: string; required: string[]; conditional: string }> = {
  student: {
    icon: GraduationCap,
    label: "Student",
    idLabel: "Student ID number",
    idHint: "As printed on your student ID card",
    required: ["idNumber", "batchYear", "idCardFront"],
    conditional: "Currently enrolled at a Bangladeshi university",
  },
  teacher: {
    icon: Briefcase,
    label: "Teacher",
    idLabel: "Faculty / Employee ID number",
    idHint: "As printed on your faculty ID card",
    required: ["idNumber", "designation", "institutionalEmail", "idCardFront"],
    conditional: "Faculty member or staff at a Bangladeshi university",
  },
  alumni: {
    icon: Award,
    label: "Alumni",
    idLabel: "Last student ID number",
    idHint: "The student ID you used before graduating",
    required: ["idNumber", "batchYear", "graduationYear", "degree", "idCardFront"],
    conditional: "Graduated from a Bangladeshi university",
  },
};

export function SignupForm() {
  const [role, setRole] = useState<Role>("student");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(null);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; fullName: string | null; type: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [universityQuery, setUniversityQuery] = useState("");
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<{ id: string; name: string } | null>(null);
  const [universityId, setUniversityId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const { register, watch, formState: { errors }, getValues } = useForm({
    mode: "onTouched",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Load universities on mount
  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((d) => setUniversities(d.universities || []))
      .catch(() => {});
  }, []);

  // Load departments when university changes
  useEffect(() => {
    if (!universityId) {
      setDepartments([]);
      return;
    }
    fetch(`/api/departments?universityId=${universityId}`)
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => setDepartments([]));
  }, [universityId]);

  // Set up file previews
  useEffect(() => {
    if (!idCard) {
      setIdCardPreview(null);
      return;
    }
    const url = URL.createObjectURL(idCard);
    setIdCardPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idCard]);

  useEffect(() => {
    if (!idCardBack) {
      setIdCardBackPreview(null);
      return;
    }
    const url = URL.createObjectURL(idCardBack);
    setIdCardBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idCardBack]);

  const filteredUnis = universities
    .filter((u) => {
      const q = universityQuery.toLowerCase();
      return !q || u.name.toLowerCase().includes(q) || (u.fullName?.toLowerCase().includes(q) ?? false);
    })
    .slice(0, 30);

  function onFile(file: File | null, setter: (f: File | null) => void) {
    if (!file) {
      setter(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5 MB)");
      return;
    }
    setter(file);
  }

  function passwordStrength(p: string): { score: number; label: string; color: string } {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Okay", color: "bg-amber-500" };
    if (score <= 4) return { score, label: "Strong", color: "bg-emerald-500" };
    return { score, label: "Excellent", color: "bg-emerald-400" };
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    // Validate password match
    const formData = new FormData(e.currentTarget);
    const pw = String(formData.get("password") || "");
    const cpw = String(formData.get("confirmPassword") || "");
    if (pw !== cpw) {
      setError("Passwords do not match");
      setErrorField("confirmPassword");
      toast.error("Passwords do not match");
      return;
    }

    if (!idCard) {
      setError("Please attach a photo of your ID card");
      setErrorField("idCardFront");
      toast.error("ID card required");
      return;
    }

    formData.set("role", role);
    formData.append("idCardFront", idCard);
    if (idCardBack) formData.append("idCardBack", idCardBack);

    startTransition(async () => {
      const result = await unifiedSignup(null, formData);
      if (result?.error) {
        setError(result.error);
        setErrorField(result.field || null);
        toast.error(result.error);
        if (result.field) {
          const el = document.querySelector(`[name="${result.field}"]`);
          if (el && "scrollIntoView" in el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }

  const pwStrength = passwordStrength(password || "");
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = password && confirmPassword && password !== confirmPassword;
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-300">{error}</p>
            {errorField ? <p className="text-xs text-danger/60 mt-0.5">Field: {errorField}</p> : null}
          </div>
        </div>
      ) : null}

      {/* Role selector */}
      <Card>
        <CardContent className="py-6">
          <Label className="mb-3 block">I am a *</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {(["student", "teacher", "alumni"] as Role[]).map((r) => {
              const M = ROLE_META[r];
              const Icon = M.icon;
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all duration-200",
                    "flex items-start gap-3",
                    active
                      ? "border-accent bg-accent/5 shadow-soft"
                      : "border-line bg-bg-soft hover:border-fg/20"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0",
                    active ? "bg-accent/15 text-accent" : "bg-fg/5 text-fg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", active && "text-accent")}>{M.label}</p>
                    <p className="text-[11px] text-fg-muted mt-0.5 leading-tight">{M.conditional}</p>
                  </div>
                  {active ? <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" /> : null}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="role" value={role} />
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">Account</p>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name *</Label>
            <Input id="fullName" {...register("fullName", { required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } })} placeholder="Rafi Ahmed" />
            <FieldError>{errors.fullName?.message as string}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email", { required: "Email is required" })} placeholder="you@example.com" autoComplete="email" />
            <FieldError>{errors.email?.message as string}</FieldError>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">Security</p>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-fg/5 flex items-center justify-center text-fg-muted"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {password ? (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1 rounded-full bg-fg/5 overflow-hidden">
                  <div className={cn("h-full transition-all duration-300", pwStrength.color)} style={{ width: `${(pwStrength.score / 5) * 100}%` }} />
                </div>
                <span className="text-xs text-fg-muted w-16 text-right">{pwStrength.label}</span>
              </div>
            ) : (
              <p className="text-xs text-fg-dim">At least 8 characters, with uppercase, lowercase, and a number.</p>
            )}
            <FieldError>{errors.password?.message as string}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
            />
            {passwordsMatch ? (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                <Check className="h-3 w-3" /> Passwords match
              </p>
            ) : passwordsMismatch ? (
              <p className="text-xs text-danger flex items-center gap-1.5">
                <X className="h-3 w-3" /> Passwords do not match
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* University & identity */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">University & identity</p>

          <div className="space-y-2 relative">
            <Label>University *</Label>
            <input type="hidden" name="universityId" value={universityId} required />
            <button
              type="button"
              onClick={() => setShowUniDropdown(!showUniDropdown)}
              className="h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm text-left hover:border-fg/30 transition-colors flex items-center justify-between"
            >
              <span className={selectedUniversity ? "text-fg" : "text-fg-dim"}>
                {selectedUniversity ? selectedUniversity.name : "Search and select your university…"}
              </span>
              <span className="text-fg-dim text-xs">▾</span>
            </button>
            {showUniDropdown ? (
              <div className="absolute z-30 top-full mt-1 w-full rounded-md border border-line bg-bg-soft shadow-soft max-h-80 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-line">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Type to search (BUET, BRAC, NSU, AUST…)"
                    value={universityQuery}
                    onChange={(e) => setUniversityQuery(e.target.value)}
                    className="h-9 w-full rounded-md bg-bg border border-line px-3 text-sm focus:outline-none focus:border-fg/40"
                  />
                </div>
                <div className="overflow-y-auto">
                  {filteredUnis.length === 0 ? (
                    <p className="text-sm text-fg-muted p-4 text-center">No matches</p>
                  ) : (
                    filteredUnis.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUniversity({ id: u.id, name: u.fullName || u.name });
                          setUniversityId(u.id);
                          setShowUniDropdown(false);
                          setUniversityQuery("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-fg/5 border-b border-line/50 last:border-b-0"
                      >
                        <p className="text-sm font-medium">{u.name}</p>
                        {u.fullName ? <p className="text-xs text-fg-muted">{u.fullName}</p> : null}
                        <p className="text-[10px] text-fg-dim uppercase tracking-wider mt-0.5">{u.type}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {universityId ? (
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department (optional)</Label>
              <Select id="departmentId" name="departmentId" defaultValue="">
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="idNumber">{meta.idLabel} *</Label>
            <Input
              id="idNumber"
              {...register("idNumber", { required: "ID number is required" })}
              placeholder={role === "teacher" ? "F-2041" : "202314001"}
            />
            <p className="text-xs text-fg-dim">{meta.idHint}</p>
            <FieldError>{errors.idNumber?.message as string}</FieldError>
          </div>

          {role === "teacher" ? (
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input id="designation" {...register("designation", { required: "Required" })} placeholder="Associate Professor" />
              <FieldError>{errors.designation?.message as string}</FieldError>
            </div>
          ) : null}

          {(role === "student" || role === "alumni") ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchYear">Batch year (admission) *</Label>
                <Input id="batchYear" type="number" min={1980} max={new Date().getFullYear()} placeholder="2023" {...register("batchYear", { required: "Required" })} />
                <FieldError>{errors.batchYear?.message as string}</FieldError>
              </div>
              {role === "alumni" ? (
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation year *</Label>
                  <Input id="graduationYear" type="number" min={1980} max={new Date().getFullYear()} placeholder="2024" {...register("graduationYear", { required: "Required" })} />
                  <FieldError>{errors.graduationYear?.message as string}</FieldError>
                </div>
              ) : null}
            </div>
          ) : null}

          {role === "alumni" ? (
            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input id="degree" {...register("degree", { required: "Required" })} placeholder="B.Sc. in Computer Science" />
              <FieldError>{errors.degree?.message as string}</FieldError>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ID card upload */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">ID card proof</p>
            <p className="text-xs text-fg-muted mt-1">Photos are private. Only Gonix admins can view them.</p>
          </div>

          <ImageDropzone
            label={`${role === "alumni" ? "Last student ID card (or degree certificate)" : `${meta.label} ID card`} — front *`}
            value={idCard}
            preview={idCardPreview}
            onChange={(f) => onFile(f, setIdCard)}
            required
          />

          <ImageDropzone
            label={`Back of ID card (optional, but helps verification)`}
            value={idCardBack}
            preview={idCardBackPreview}
            onChange={(f) => onFile(f, setIdCardBack)}
            optional
          />
        </CardContent>
      </Card>

      {/* Optional extras */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">Optional extras</p>

          {role === "teacher" ? (
            <div className="space-y-2">
              <Label htmlFor="institutionalEmail">Institutional email *</Label>
              <Input id="institutionalEmail" name="institutionalEmail" type="email" required placeholder="you@your-university.edu.bd" />
              <p className="text-xs text-fg-dim">Required for teachers. Speeds up verification significantly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="institutionalEmail">Institutional email (preferred)</Label>
              <Input id="institutionalEmail" name="institutionalEmail" type="email" placeholder="you@your-university.edu.bd" />
              <p className="text-xs text-fg-dim">Speeds up verification. Should end with your university&apos;s domain.</p>
            </div>
          )}

          {role === "alumni" ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current company</Label>
                <Input id="currentCompany" name="currentCompany" placeholder="Grameenphone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentTitle">Current title</Label>
                <Input id="currentTitle" name="currentTitle" placeholder="Senior Product Manager" />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="01712345678" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea id="bio" name="bio" maxLength={500} placeholder="What are you studying / researching / building?" />
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card className="border-accent/20 bg-accent/[0.02]">
        <CardContent className="py-4">
          <p className="text-sm font-medium mb-2">By submitting, you confirm:</p>
          <ul className="space-y-1.5 text-xs text-fg-muted">
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              The information above is accurate and the ID photo is mine.
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              I consent to admin review of my submission.
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              My ID card images will be stored privately and only visible to Gonix admins.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-bg/80 backdrop-blur-sm p-3 rounded-lg border border-line">
        <p className="text-xs text-fg-muted hidden sm:block">
          You&apos;ll receive an email once an admin reviews your submission.
        </p>
        <Button type="submit" loading={pending} size="lg" className="ml-auto">
          Submit for verification
        </Button>
      </div>
    </form>
  );
}

function ImageDropzone({
  label,
  value,
  preview,
  onChange,
  required,
  optional,
}: {
  label: string;
  value: File | null;
  preview: string | null;
  onChange: (f: File | null) => void;
  required?: boolean;
  optional?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onChange(file);
        }}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200",
          "flex items-center justify-center",
          value ? "p-3 border-solid border-accent/40 bg-accent/5 cursor-default" : "p-6 cursor-pointer hover:border-fg/30",
          dragOver && "border-accent bg-accent/5",
          !value && "border-line"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
        {value && preview ? (
          <div className="flex items-center gap-4 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-20 w-28 object-cover rounded-md border border-line" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{value.name}</p>
              <p className="text-xs text-fg-muted">{(value.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="h-8 w-8 rounded-md hover:bg-fg/10 flex items-center justify-center text-fg-muted"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="h-10 w-10 rounded-full bg-fg/5 flex items-center justify-center mb-2 mx-auto">
              <Upload className="h-4 w-4 text-fg-muted" />
            </div>
            <p className="text-sm font-medium">
              Drop image or <span className="text-accent">browse</span>
            </p>
            <p className="text-xs text-fg-muted mt-1">JPG, PNG, WebP · up to 5 MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
