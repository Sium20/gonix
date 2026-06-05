import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function maskId(id: string | null | undefined): string {
  if (!id) return "—";
  if (id.length <= 4) return "•".repeat(id.length);
  return "•".repeat(id.length - 4) + id.slice(-4);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function timeAgo(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  alumni: "Alumni",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  student: "Currently enrolled at a Bangladeshi university",
  teacher: "Faculty member or staff at a Bangladeshi university",
  alumni: "Graduated from a Bangladeshi university",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-danger border-red-200",
  suspended: "bg-zinc-100 text-fg-muted border-zinc-200",
};
