"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { UniversitySelect } from "./UniversitySelect";
import { cn, ROLE_LABELS } from "@/lib/utils";

type FormValues = Record<string, any>;

export function RegistrationForm({
  role,
  fields,
  action,
}: {
  role: "student" | "teacher" | "alumni";
  fields: Array<{
    name: string;
    label: string;
    type?: "text" | "email" | "password" | "number" | "url" | "tel" | "textarea";
    placeholder?: string;
    required?: boolean;
    hint?: string;
    dependsOn?: { field: string; value: string };
  }>;
  action: (prev: any, fd: FormData) => Promise<any>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [idCard, setIdCard] = useState<File | null>(null);
  const [supportingDoc, setSupportingDoc] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [watched, setWatched] = useState<Record<string, any>>({});
  const totalSteps = 4;

  const { register, handleSubmit, formState: { errors }, getValues, watch } = useForm<FormValues>({
    mode: "onTouched",
  });

  // Watch all values for cross-field visibility
  const w = watch((val) => {
    setWatched((prev) => ({ ...prev, ...val }));
  });

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    if (!idCard) {
      toast.error("Please attach your ID card photo");
      setStep(totalSteps - 1);
      return;
    }
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    });
    fd.append("idCardFront", idCard);
    if (supportingDoc) fd.append("supportingDoc", supportingDoc);

    startTransition(async () => {
      const result = await action(null, fd);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
        if (result.field) {
          // try to navigate to the step containing that field
          // simple heuristic
          if (["fullName", "phone", "bio", "email", "password"].includes(result.field)) setStep(0);
          else if (["universityId", "departmentId", "studentId", "facultyId", "designation", "batchYear", "graduationYear", "degree", "lastStudentId", "currentCompany", "currentTitle"].includes(result.field)) setStep(1);
          else if (["institutionalEmail", "socialLinkedin", "socialGithub"].includes(result.field)) setStep(2);
        }
      }
    });
  };

  const stepLabels = ["Account", "University", "Extras", "ID Proof"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ROLE_LABELS[role]} registration</CardTitle>
        <CardDescription>Step {step + 1} of {totalSteps} — {stepLabels[step]}</CardDescription>
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-fg/10")} />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError ? (
            <div className="rounded-md border border-danger/20 bg-danger/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{serverError}</p>
            </div>
          ) : null}

          {step === 0 ? (
            <div className="space-y-4 animate-fade-in">
              <Field label="Full name" name="fullName" required error={errors.fullName?.message as string}>
                <Input {...register("fullName", { required: "Name is required" })} placeholder="Rafi Ahmed" />
              </Field>
              <Field label="Email" name="email" required error={errors.email?.message as string}>
                <Input {...register("email", { required: "Email is required" })} type="email" placeholder="you@example.com" />
              </Field>
              <Field label="Password" name="password" required error={errors.password?.message as string} hint="At least 8 characters, with upper/lowercase and a number.">
                <Input {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })} type="password" />
              </Field>
              <Field label="Phone (optional)" name="phone" error={errors.phone?.message as string} hint="Bangladeshi mobile, e.g. 01712345678">
                <Input {...register("phone")} type="tel" placeholder="01712345678" />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4 animate-fade-in">
              <UniversitySelect name="universityId" required />
              <Field label="Department (optional)" name="departmentId" error={errors.departmentId?.message as string}>
                <DepartmentSelectCascade universityId={watched.universityId} name="departmentId" register={register} />
              </Field>
              {role === "student" || role === "alumni" ? (
                <Field label={role === "student" ? "Student ID" : "Last student ID"} name={role === "student" ? "studentId" : "lastStudentId"} required error={(errors as any)[role === "student" ? "studentId" : "lastStudentId"]?.message as string} hint="As printed on your ID card">
                  <Input {...register(role === "student" ? "studentId" : "lastStudentId", { required: "Required" })} placeholder="202314001" />
                </Field>
              ) : null}
              {role === "teacher" ? (
                <Field label="Faculty ID" name="facultyId" required error={errors.facultyId?.message as string}>
                  <Input {...register("facultyId", { required: "Required" })} placeholder="F-2041" />
                </Field>
              ) : null}
              {role === "teacher" ? (
                <Field label="Designation" name="designation" required error={errors.designation?.message as string}>
                  <Input {...register("designation", { required: "Required" })} placeholder="Associate Professor" />
                </Field>
              ) : null}
              {role === "student" || role === "alumni" ? (
                <Field label={role === "student" ? "Batch year (admission)" : "Batch year (admission)"} name="batchYear" required error={errors.batchYear?.message as string}>
                  <Input {...register("batchYear", { required: "Required" })} type="number" min={1990} max={new Date().getFullYear()} placeholder="2023" />
                </Field>
              ) : null}
              {role === "alumni" ? (
                <>
                  <Field label="Graduation year" name="graduationYear" required error={errors.graduationYear?.message as string}>
                    <Input {...register("graduationYear", { required: "Required" })} type="number" min={1990} max={new Date().getFullYear()} placeholder="2024" />
                  </Field>
                  <Field label="Degree" name="degree" required error={errors.degree?.message as string}>
                    <Input {...register("degree", { required: "Required" })} placeholder="B.Sc. in Computer Science" />
                  </Field>
                </>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4 animate-fade-in">
              <Field label={role === "teacher" ? "Institutional email" : "Institutional email (preferred)"} name="institutionalEmail" required={role === "teacher"} error={errors.institutionalEmail?.message as string} hint={role === "teacher" ? "Required for teachers. Should end with your university's domain." : "Speeds up verification. e.g. you@buet.ac.bd"}>
                <Input {...register("institutionalEmail")} type="email" placeholder="you@your-university.edu.bd" />
              </Field>
              {role === "alumni" ? (
                <>
                  <Field label="Current company (optional)" name="currentCompany">
                    <Input {...register("currentCompany")} placeholder="Grameenphone" />
                  </Field>
                  <Field label="Current title (optional)" name="currentTitle">
                    <Input {...register("currentTitle")} placeholder="Senior Product Manager" />
                  </Field>
                </>
              ) : null}
              <Field label="LinkedIn (optional)" name="socialLinkedin">
                <Input {...register("socialLinkedin")} type="url" placeholder="https://linkedin.com/in/..." />
              </Field>
              {role !== "alumni" ? (
                <Field label="GitHub (optional)" name="socialGithub">
                  <Input {...register("socialGithub")} type="url" placeholder="https://github.com/..." />
                </Field>
              ) : null}
              <Field label="Short bio (optional)" name="bio" hint={`${(watched.bio || "").length}/500 — visible on your public profile`}>
                <Textarea {...register("bio")} placeholder="What are you studying / researching / building?" maxLength={500} />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5 animate-fade-in">
              <FileDropzone
                name="idCardFront"
                label="Photo of your ID card (front) *"
                value={idCard}
                onChange={setIdCard}
                required
                hint="JPG, PNG, or WebP. Maximum 5 MB. Private — only admins see this."
              />
              {role === "alumni" ? (
                <FileDropzone
                  name="supportingDoc"
                  label="Degree certificate or final student ID (optional but recommended)"
                  value={supportingDoc}
                  onChange={setSupportingDoc}
                />
              ) : null}
              <div className="rounded-md border border-line bg-bg-card p-4 text-xs text-fg-muted space-y-1.5">
                <p className="font-medium text-fg">By submitting, you confirm:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" /> The information above is accurate.</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" /> The ID photo is yours and not edited.</li>
                  <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" /> You consent to admin review of your submission.</li>
                </ul>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-4 border-t border-line">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={back} disabled={pending}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < totalSteps - 1 ? (
              <Button type="button" onClick={next}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" loading={pending}>
                Submit for verification
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, name, required, error, hint, children }: { label: string; name: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required ? <span className="text-accent">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-fg-dim">{hint}</p> : null}
      <FieldError>{error}</FieldError>
    </div>
  );
}

function DepartmentSelectCascade({ universityId, name, register }: { universityId: string | undefined; name: string; register: any }) {
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

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

  if (!universityId) {
    return <p className="text-xs text-fg-dim">Pick a university first to load departments.</p>;
  }

  return (
    <select
      id={name}
      {...register(name)}
      className="h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm focus:outline-none focus:border-fg/40"
      defaultValue=""
    >
      <option value="">Select department</option>
      {departments.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
