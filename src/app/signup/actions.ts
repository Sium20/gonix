"use server";

import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/storage";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Unified schema for single-page signup. Each role has slightly different
// required fields, but we accept all in one object and validate by role.

const phoneSchema = z
  .string()
  .regex(/^(\+?880|0)?1[3-9]\d{8}$/, "Invalid Bangladeshi phone (e.g. 01712345678)")
  .optional()
  .or(z.literal(""));

const baseSchema = z.object({
  role: z.enum(["student", "teacher", "alumni"]),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email").max(120).transform((s) => s.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  phone: phoneSchema,
  universityId: z.string().min(1, "Select your university"),
  departmentId: z.string().optional().or(z.literal("")),
  idNumber: z.string().min(1, "ID number is required").max(40),
  batchYear: z.coerce.number().int().min(1980).max(new Date().getFullYear()).optional(),
  graduationYear: z.coerce.number().int().min(1980).max(new Date().getFullYear()).optional(),
  degree: z.string().max(80).optional().or(z.literal("")),
  designation: z.string().max(80).optional().or(z.literal("")),
  institutionalEmail: z.string().email().optional().or(z.literal("")),
  currentCompany: z.string().max(80).optional().or(z.literal("")),
  currentTitle: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function unifiedSignup(_prev: any, fd: FormData) {
  const raw: Record<string, any> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") raw[k] = v;
  }

  // Role-specific validation
  const role = raw.role;
  if (!["student", "teacher", "alumni"].includes(role)) {
    return { error: "Please select a role", field: "role" };
  }

  // Role-specific ID field requirements
  if (role === "teacher" && !raw.designation) {
    return { error: "Designation is required for teachers", field: "designation" };
  }
  if (role === "alumni" && !raw.graduationYear) {
    return { error: "Graduation year is required for alumni", field: "graduationYear" };
  }
  if (role === "alumni" && !raw.degree) {
    return { error: "Degree is required for alumni", field: "degree" };
  }
  if (role === "teacher" && !raw.institutionalEmail) {
    return { error: "Institutional email is required for teachers", field: "institutionalEmail" };
  }
  if ((role === "student" || role === "alumni") && !raw.batchYear) {
    return { error: "Batch year is required", field: "batchYear" };
  }

  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message, field: first.path[0] as string };
  }
  const data = parsed.data;

  // Check email uniqueness
  const existing = await prisma.profile.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "An account with this email already exists", field: "email" };
  }

  // ID card file is required
  const idCard = fd.get("idCardFront") as File | null;
  if (!idCard || idCard.size === 0) {
    return { error: "Please attach a photo of your ID card", field: "idCardFront" };
  }

  // Validate university
  const uni = await prisma.university.findUnique({ where: { id: data.universityId } });
  if (!uni) return { error: "Invalid university", field: "universityId" };

  // Email domain match
  const emailDomainMatch = !!(data.institutionalEmail && uni.domain && data.institutionalEmail.toLowerCase().endsWith("@" + uni.domain.toLowerCase()));

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Generate handle
  const idSlug = role === "student" ? data.idNumber : role === "teacher" ? data.idNumber : data.idNumber;
  const baseHandle = slugify(`${data.fullName}-${uni.slug}-${idSlug}`);
  let handle = baseHandle || slugify(data.fullName);
  let n = 1;
  while (await prisma.profile.findUnique({ where: { handle } })) {
    handle = `${baseHandle}-${++n}`;
  }

  // Save optional supporting document
  let supportingDocPath: string | null = null;
  const supporting = fd.get("idCardBack") as File | null;
  if (supporting && supporting.size > 0) {
    // Save it once we have a profile id; do it after
  }

  // Create profile
  const profile = await prisma.profile.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      handle,
      role: role as string,
      phone: data.phone || null,
      universityId: data.universityId,
      departmentId: data.departmentId || null,
      status: "pending",
      bio: data.bio || null,
      // role-specific
      studentId: role !== "teacher" ? data.idNumber : null,
      facultyId: role === "teacher" ? data.idNumber : null,
      batchYear: data.batchYear || null,
      graduationYear: data.graduationYear || null,
      degree: data.degree || null,
      designation: data.designation || null,
      currentCompany: data.currentCompany || null,
      currentTitle: data.currentTitle || null,
    },
  });

  // Save files
  const idCardFront = await saveUpload(idCard, "id-cards", profile.id);
  if (supporting && supporting.size > 0) {
    const r = await saveUpload(supporting, "id-cards", profile.id);
    supportingDocPath = r.relPath;
  }

  // Create verification request
  await prisma.verificationRequest.create({
    data: {
      profileId: profile.id,
      universityId: data.universityId,
      idCardFrontPath: idCardFront.relPath,
      supportingDocPath,
      declaredUniversity: uni.name,
      declaredIdNumber: data.idNumber,
      institutionalEmail: data.institutionalEmail || null,
      emailDomainMatch,
    },
  });

  await sendEmail({
    to: data.email,
    ...emailTemplates.registrationSubmitted(data.fullName),
  });

  revalidatePath("/admin/verifications");
  redirect(`/register/success?role=${role}&handle=${handle}`);
}
