/**
 * TimTim — "Find your own team for your work"
 *
 * Types and placeholder helpers for the TimTim section.
 * DB models, server actions, and richer schemas will be added as features
 * are introduced.
 */

export type TimTimCategory =
  | "hackathon"
  | "research"
  | "open-source"
  | "startup"
  | "side-project"
  | "student-org"
  | "course-project"
  | "other";

export const TIMTIM_CATEGORIES: { value: TimTimCategory; label: string }[] = [
  { value: "hackathon", label: "Hackathon" },
  { value: "research", label: "Research" },
  { value: "open-source", label: "Open source" },
  { value: "startup", label: "Startup / venture" },
  { value: "side-project", label: "Side project" },
  { value: "student-org", label: "Student org" },
  { value: "course-project", label: "Course project" },
  { value: "other", label: "Other" },
];

export type TimTimRole =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "design"
  | "ml-ai"
  | "data"
  | "devops"
  | "research"
  | "writing"
  | "product"
  | "marketing"
  | "other";

export const TIMTIM_ROLES: { value: TimTimRole; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full-stack" },
  { value: "mobile", label: "Mobile (iOS / Android)" },
  { value: "design", label: "Design (UI / UX)" },
  { value: "ml-ai", label: "ML / AI" },
  { value: "data", label: "Data" },
  { value: "devops", label: "DevOps / Infra" },
  { value: "research", label: "Research" },
  { value: "writing", label: "Writing / Editorial" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing / Growth" },
  { value: "other", label: "Other" },
];

export type TimTimStatus = "open" | "in-progress" | "closed";

export const TIMTIM_STATUSES: { value: TimTimStatus; label: string; variant: "success" | "warning" | "muted" }[] = [
  { value: "open", label: "Open", variant: "success" },
  { value: "in-progress", label: "In progress", variant: "warning" },
  { value: "closed", label: "Closed", variant: "muted" },
];

/**
 * Shape of a TimTim project listing. Not yet backed by a DB model.
 * Once the model is added in prisma/schema.prisma, this type should mirror it.
 */
export type TimTimProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: TimTimCategory;
  rolesNeeded: TimTimRole[];
  status: TimTimStatus;
  ownerHandle: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  universityName: string | null;
  teamSize: number;
  capacity: number;
  deadline: string | null; // ISO date string
  createdAt: string;
  isVerifiedOwner: boolean;
};
