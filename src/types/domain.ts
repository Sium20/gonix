// Shared types

export type Role = "student" | "teacher" | "alumni" | "admin" | "super_admin";
export type ProfileStatus = "pending" | "verified" | "rejected" | "suspended";
export type Decision = "pending" | "approved" | "rejected";

export type PublicProfile = {
  id: string;
  handle: string;
  fullName: string;
  role: Role;
  status: ProfileStatus;
  avatarUrl: string | null;
  bio: string | null;
  university: { id: string; name: string; slug: string };
  department: { id: string; name: string } | null;
  batchYear: number | null;
  graduationYear: number | null;
  currentCompany: string | null;
  currentTitle: string | null;
  designation: string | null;
  socialLinks: Record<string, string>;
  showEmail: boolean;
  email: string | null;
  showPhone: boolean;
  phone: string | null;
  verifiedAt: string | null;
};
