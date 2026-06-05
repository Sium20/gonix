"use server";

import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/storage";
import { sendEmail, emailTemplates } from "@/lib/email";
import { studentRegistrationSchema, teacherRegistrationSchema, alumniRegistrationSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createProfileFromFormData(
  schema:
    | typeof studentRegistrationSchema
    | typeof teacherRegistrationSchema
    | typeof alumniRegistrationSchema,
  role: "student" | "teacher" | "alumni",
  fd: FormData
): Promise<{ ok: true; handle: string } | { ok: false; error: string; field?: string }> {
  const raw: Record<string, any> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  const idCard = fd.get("idCardFront") as File | null;
  if (!idCard || idCard.size === 0) {
    return { ok: false, error: "Please attach a photo of your ID card", field: "idCardFront" };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first.message, field: first.path[0] as string };
  }
  // Cast to any: the three role schemas have disjoint fields (studentId /
  // facultyId / lastStudentId), and the body of this function already uses
  // role-conditional access through `(data as any)` for those branches.
  const data: any = parsed.data;

  // Check email uniqueness
  const existing = await prisma.profile.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists", field: "email" };
  }

  // Validate university
  const uni = await prisma.university.findUnique({ where: { id: data.universityId } });
  if (!uni) return { ok: false, error: "Invalid university", field: "universityId" };

  // Email domain match
  const emailDomainMatch = !!(data.institutionalEmail && uni.domain && data.institutionalEmail.toLowerCase().endsWith("@" + uni.domain.toLowerCase()));

  // Save ID card first (need profileId for filename)
  const passwordHash = await bcrypt.hash(data.password, 10);
  const baseHandle = slugify(`${data.fullName}-${uni.slug}-${role === "student" ? data.studentId : role === "teacher" ? data.facultyId : data.lastStudentId}`);
  let handle = baseHandle || slugify(data.fullName);
  let n = 1;
  while (await prisma.profile.findUnique({ where: { handle } })) {
    handle = `${baseHandle}-${++n}`;
  }

  const socialLinks: Record<string, string> = {};
  if (data.socialLinkedin) socialLinks.linkedin = data.socialLinkedin;
  if ("socialGithub" in data && data.socialGithub) socialLinks.github = (data as any).socialGithub;

  // Create profile
  const profile = await prisma.profile.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      handle,
      role,
      phone: (data as any).phone || null,
      universityId: data.universityId,
      departmentId: (data as any).departmentId || null,
      status: "pending",
      socialLinks: Object.keys(socialLinks).length ? JSON.stringify(socialLinks) : null,
      bio: (data as any).bio || null,
    },
  });

  // Save files
  const idCardFront = await saveUpload(idCard, "id-cards", profile.id);
  const supportingDoc = fd.get("supportingDoc");
  let supportingDocPath: string | null = null;
  if (supportingDoc instanceof File && supportingDoc.size > 0) {
    const r = await saveUpload(supportingDoc, "id-cards", profile.id);
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
      declaredIdNumber: role === "student" ? (data as any).studentId : role === "teacher" ? (data as any).facultyId : (data as any).lastStudentId,
      institutionalEmail: (data as any).institutionalEmail || null,
      emailDomainMatch,
    },
  });

  // Add role-specific fields directly on profile
  if (role === "student") {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { studentId: (data as any).studentId, batchYear: (data as any).batchYear },
    });
  } else if (role === "teacher") {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { facultyId: (data as any).facultyId, designation: (data as any).designation },
    });
  } else {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        studentId: (data as any).lastStudentId,
        batchYear: (data as any).batchYear,
        graduationYear: (data as any).graduationYear,
        degree: (data as any).degree,
        currentCompany: (data as any).currentCompany || null,
        currentTitle: (data as any).currentTitle || null,
      },
    });
  }

  // Mock email
  await sendEmail({
    to: data.email,
    ...emailTemplates.registrationSubmitted(data.fullName),
  });

  return { ok: true, handle };
}

export async function registerStudent(_prev: any, fd: FormData) {
  const result = await createProfileFromFormData(studentRegistrationSchema, "student", fd);
  if (!result.ok) return { error: result.error, field: result.field };
  redirect(`/register/success?role=student&handle=${result.handle}`);
}

export async function registerTeacher(_prev: any, fd: FormData) {
  const result = await createProfileFromFormData(teacherRegistrationSchema, "teacher", fd);
  if (!result.ok) return { error: result.error, field: result.field };
  redirect(`/register/success?role=teacher&handle=${result.handle}`);
}

export async function registerAlumni(_prev: any, fd: FormData) {
  const result = await createProfileFromFormData(alumniRegistrationSchema, "alumni", fd);
  if (!result.ok) return { error: result.error, field: result.field };
  redirect(`/register/success?role=alumni&handle=${result.handle}`);
}
