import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number");

export const emailSchema = z.string().email("Invalid email").max(120).transform((s) => s.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .regex(/^(\+?880|0)?1[3-9]\d{8}$/, "Invalid Bangladeshi phone (e.g. 01712345678)")
  .optional()
  .or(z.literal(""));

const baseProfile = {
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: phoneSchema,
  bio: z.string().max(500).optional(),
};

export const studentRegistrationSchema = z.object({
  ...baseProfile,
  email: emailSchema,
  password: passwordSchema,
  universityId: z.string().min(1, "Select a university"),
  departmentId: z.string().optional().or(z.literal("")),
  studentId: z.string().min(1, "Student ID is required").max(40),
  batchYear: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
  institutionalEmail: z.string().email().optional().or(z.literal("")),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
  socialGithub: z.string().url().optional().or(z.literal("")),
});

export const teacherRegistrationSchema = z.object({
  ...baseProfile,
  email: emailSchema,
  password: passwordSchema,
  universityId: z.string().min(1, "Select a university"),
  departmentId: z.string().optional().or(z.literal("")),
  facultyId: z.string().min(1, "Faculty ID is required").max(40),
  designation: z.string().min(1, "Designation is required").max(80),
  institutionalEmail: z.string().email("Institutional email required for teachers"),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
  socialGithub: z.string().url().optional().or(z.literal("")),
});

export const alumniRegistrationSchema = z.object({
  ...baseProfile,
  email: emailSchema,
  password: passwordSchema,
  universityId: z.string().min(1, "Select a university"),
  departmentId: z.string().optional().or(z.literal("")),
  graduationYear: z.coerce.number().int().min(1980).max(new Date().getFullYear()),
  batchYear: z.coerce.number().int().min(1980).max(new Date().getFullYear()),
  degree: z.string().min(1, "Degree is required").max(80),
  lastStudentId: z.string().min(1, "Last student ID is required").max(40),
  currentCompany: z.string().max(80).optional().or(z.literal("")),
  currentTitle: z.string().max(80).optional().or(z.literal("")),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const verificationDecisionSchema = z.object({
  requestId: z.string(),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional(),
});
