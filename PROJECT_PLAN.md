# Gonix — Project Plan & Analysis

> **Bangladeshi Verified Academic Network**
> A trusted portal for **Students, Teachers, and Alumni** of Bangladeshi universities, gated by admin-verified identity (university ID + ID card image).

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Problem Statement & Opportunity](#2-problem-statement--opportunity)
3. [Target Users & Personas](#3-target-users--personas)
4. [Core Value Proposition](#4-core-value-proposition)
5. [Feature Scope — MVP vs. Future](#5-feature-scope--mvp-vs-future)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema Design](#8-database-schema-design)
9. [Key User Flows](#9-key-user-flows)
10. [Admin Verification Workflow](#10-admin-verification-workflow)
11. [Security, Privacy & BD Legal Compliance](#11-security-privacy--bd-legal-compliance)
12. [University Data Strategy](#12-university-data-strategy)
13. [File & Asset Management](#13-file--asset-management)
14. [UI / UX Direction](#14-ui--ux-direction)
15. [Email & Notification System](#15-email--notification-system)
16. [Internationalization (Bangla + English)](#16-internationalization-bangla--english)
17. [Development Phases & Timeline](#17-development-phases--timeline)
18. [Cost Estimation](#18-cost-estimation)
19. [Risks & Mitigation](#19-risks--mitigation)
20. [Success Metrics](#20-success-metrics)
21. [Open Questions / Decisions Needed](#21-open-questions--decisions-needed)
22. [Recommended Next Steps](#22-recommended-next-steps)
23. [Appendix: Research Notes](#23-appendix-research-notes)

---

## 1. Project Summary

**Gonix** is a verified, identity-gated academic network for Bangladesh. Users register as one of three audiences — **Student**, **Teacher (Faculty)**, or **Alumni** — and submit a university-issued ID + a photo of their ID card. An admin manually verifies the submission against the chosen institution. Only approved profiles are visible in the public directory.

The portal's **moat** is *trust*: every profile you see corresponds to a real, admin-verified person attached to a real Bangladeshi university. This is the missing layer between Facebook (no trust), LinkedIn (no BD-university context), and per-university SIS portals (no cross-university visibility).

### Why this matters in Bangladesh
- **~160+ public + private universities**, **~4M+ students**, **~80K+ faculty** — fragmented across hundreds of disconnected SIS portals.
- No pan-university verified identity layer exists today.
- Alumni networks are largely inactive post-graduation.
- The Bangladesh Personal Data Protection Ordinance, 2025 now mandates explicit consent, purpose limitation, and data minimization — building compliant from day one is a competitive advantage.

---

## 2. Problem Statement & Opportunity

| Pain Point (Today) | Gonix Solution |
|---|---|
| Fake profiles pollute every public platform | Admin-verified ID + ID card gating |
| Alumni lose contact with batchmates | Persistent verified profile, batch-group discovery |
| Teachers across unis can't find each other | Cross-university faculty directory |
| Students can't tell real seniors from imposters | Verified badge + university email match |
| No central BD academic network | One verified directory, search by uni / dept / batch / role |
| Privacy: blanket exposure of NID / student ID on current platforms | Field-level privacy controls; ID shown as `••••1234` to non-connections |

---

## 3. Target Users & Personas

### Primary Personas

**Persona 1 — "Rafi" — 2nd year CSE, AUST**
- Wants to find seniors at his uni for project help, find friends at other unis for hackathons.
- Has `.edu.bd` email (or institutional), has student ID card.
- **Willing to upload ID card** if process is < 2 minutes and data is clearly protected.

**Persona 2 — "Dr. Nazia" — Assistant Professor, BRAC University**
- Wants cross-university research collaborators, conference contacts, alumni connections.
- Has faculty ID card, official email, university website profile.
- Will not register if verification takes > 72 hours.

**Persona 3 — "Tasnim" — Alumna, BUET CSE '18**
- Wants to stay connected to batch, mentor current students, find job referrals.
- Has degree certificate + old student ID, but no current institutional email.
- Verification must accept alternative proof (degree + last student ID).

### Secondary Personas
- **University Admin** (potential partner — could auto-verify their own students in future).
- **Recruiter / Employer** (paid tier, later phase).
- **Gonix Internal Admin** (you / your team — verification queue operator).

---

## 4. Core Value Proposition

> **"The only Bangladeshi academic network where every profile is a real, verified person."**

Three pillars:
1. **Trust** — Admin-verified identity for every account.
2. **Discovery** — Search across all BD unis by role, department, batch, skill.
3. **Continuity** — Students stay connected as alumni; teachers remain discoverable across career moves.

---

## 5. Feature Scope — MVP vs. Future

### MVP (Phase 1–6, ~12–14 weeks) — the "Must Have"

| Module | Features |
|---|---|
| **Auth** | Email/password + email verification; Google OAuth optional. No social-only login (defeats trust). |
| **Registration (3 flows)** | Student / Teacher / Alumni — each with tailored fields and ID proof requirements |
| **ID Card Upload** | Drag-drop, image compression client-side, JPG/PNG/WebP, max 5 MB |
| **Admin Verification Queue** | Pending list, image viewer, approve/reject with reason, audit log |
| **Profile** | Public view: name, role, university, dept, batch, bio, social links, **verified badge** |
| **Privacy Controls** | Toggle visibility of email, phone, student ID, exact batch |
| **Search / Directory** | Filter by role, university, department, batch year, keyword |
| **University Pages** | Auto-generated page per university: count, departments, recent verified members |
| **Notifications** | Email + in-app: registration status, new connection, mentions |
| **Admin Dashboard** | Stats, verification queue, user search, university CRUD, audit log |

### Phase 2 (Month 4–6) — "Should Have"

- Connections / Follow
- Direct messaging (1:1, basic, abuse-reportable)
- Posts / short updates feed
- Saved searches
- Bulk CSV import for university partnerships

### Phase 3 (Month 6–12) — "Could Have"

- Alumni mentorship matching
- Job/internship board (recruiter tier, paid)
- Events (reunions, seminars)
- Auto-verification for unis with public APIs (BUBT, Presidency, DU…)
- Mobile app (React Native / Expo)
- Bangla language UI
- Public API for partner universities

---

## 6. User Roles & Permissions

| Role | Can Register? | Can be Verified? | Can Verify Others? | Notes |
|---|---|---|---|---|
| `guest` | Yes (signup only) | No | No | Sees landing + universities, no profiles |
| `student` | No (must register with this role) | Yes | No | Default post-MVP |
| `teacher` | No | Yes | No | |
| `alumni` | No | Yes | No | |
| `admin` | No (created via DB seed / super admin) | n/a | Yes | The verification workers |
| `super_admin` | No | n/a | Yes + can create admins | You / co-founders |

### Permission Matrix (post-verification)

| Action | Student/Teacher/Alumni | Admin | Super Admin |
|---|---|---|---|
| Edit own profile | ✅ | ✅ | ✅ |
| View public profiles | ✅ | ✅ | ✅ |
| View ID card images | ❌ (only their own) | ✅ | ✅ |
| Approve / reject registrations | ❌ | ✅ | ✅ |
| Suspend users | ❌ | ✅ | ✅ |
| Add / remove admins | ❌ | ❌ | ✅ |
| Edit university data | ❌ | ✅ | ✅ |
| View audit log | ❌ | ✅ (own actions) | ✅ (all) |

---

## 7. Technical Architecture

### Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) + TypeScript | SSR for SEO on public profiles, server actions for admin mutations, single deploy target |
| **Database** | PostgreSQL via Supabase | First-class RLS, free tier, real-time subscriptions for admin queue, easy migrations |
| **Auth** | Supabase Auth (email + Google OAuth) | Built-in email verification, JWT, RLS integration |
| **File Storage** | Supabase Storage (`id-cards` bucket, **private**, signed-URL only) | Stores PII; private bucket is non-negotiable |
| **Public Images** | Cloudinary (avatars, public uploads) | CDN, on-the-fly transforms, WebP auto |
| **Styling** | Tailwind CSS + shadcn/ui | Fast iteration, accessible defaults |
| **Animations** | Framer Motion | Subtle, professional |
| **State (client)** | Zustand | Cart-like (multi-step registration) state persistence |
| **Forms** | react-hook-form + zod | Type-safe, performant validation |
| **Email** | Resend (transactional) | Best DX, free tier 3k/mo, BD deliverability decent |
| **SMS OTP** (optional, for phone verification) | SSL Wireless / BulkSMSBD | Local BD providers |
| **Deployment** | Vercel | Native Next.js, preview deploys per PR |
| **Monitoring** | Sentry (errors) + Plausible (analytics, privacy-friendly) | No cookies needed for Plausible = BD-DPA-friendly |
| **Background Jobs** | Supabase Edge Functions + cron, or Inngest | Verification reminders, batch emails |
| **Secrets** | Vercel env + Supabase Vault | Never `.env` in repo |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client (Browser)                          │
│   Next.js App Router (RSC + Client Components)                  │
│   - Public pages (RSC)    - Admin dashboard (RSC + client)      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  HTTPS / Server Actions
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                    Next.js (Vercel Edge)                        │
│   - Route Handlers  - Server Actions  - Middleware (auth)      │
│   - Image opt       - SEO metadata                             │
└─────┬───────────────────┬──────────────────┬────────────────────┘
      │                   │                  │
      │                   │                  │
┌─────▼──────┐   ┌─────────▼────────┐  ┌──────▼──────┐
│  Supabase  │   │  Cloudinary      │  │   Resend    │
│  (Postgres │   │  (public images) │  │   (email)   │
│   Auth     │   │                  │  │             │
│   Storage) │   │                  │  │             │
└────────────┘   └──────────────────┘  └─────────────┘
      │
      │  RLS-protected
      ▼
  ┌───────────────────────────────────────────┐
  │   PostgreSQL — users, profiles,           │
  │   verification_requests, audit_logs,      │
  │   universities, departments, connections  │
  └───────────────────────────────────────────┘
```

### Folder Structure (planned)

```
ts-portal/
├── .env.local.example
├── README.md
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── seed.sql                # Universities seed
│   └── policies/               # RLS policies
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Landing
│   │   │   ├── universities/              # University directory
│   │   │   ├── u/[handle]/                # Public profile
│   │   │   └── search/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/                  # Role chooser
│   │   │   ├── register/student/
│   │   │   ├── register/teacher/
│   │   │   ├── register/alumni/
│   │   │   └── verify-email/
│   │   ├── (app)/                          # Authenticated app
│   │   │   ├── dashboard/                 # "Awaiting verification" or "Profile"
│   │   │   ├── profile/edit/
│   │   │   ├── connections/
│   │   │   └── settings/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── verifications/         # The queue
│   │   │       ├── users/
│   │   │       ├── universities/
│   │   │       └── audit-log/
│   │   ├── api/
│   │   │   ├── webhooks/resend/
│   │   │   └── upload/sign/                # Signed upload URLs
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # shadcn primitives
│   │   ├── auth/
│   │   ├── registration/                   # Multi-step form steps
│   │   ├── profile/
│   │   ├── admin/                          # Verification queue UI
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                   # server client
│   │   │   ├── client.ts                   # browser client
│   │   │   └── admin.ts                    # service-role (server-only)
│   │   ├── cloudinary.ts
│   │   ├── email/
│   │   │   ├── client.ts
│   │   │   └── templates/
│   │   ├── validators/                     # zod schemas
│   │   ├── rbac.ts
│   │   └── utils.ts
│   ├── store/                              # Zustand (registration wizard)
│   └── types/
│       ├── database.ts                     # Supabase generated
│       └── domain.ts
└── public/
```

---

## 8. Database Schema Design

> All tables in `public` schema. UUID PKs. `created_at` / `updated_at` timestamps. Soft delete (`deleted_at`) for users only.

### Core Tables

```sql
-- 8.1 Universities (seeded, not user-generated initially)
universities (
  id              uuid pk,
  name            text not null,            -- "BUET"
  full_name       text,                     -- "Bangladesh University of Engineering and Technology"
  type            university_type enum,     -- public | private | national | madrasah | medical
  division        text,                     -- "Dhaka"
  city            text,
  website         text,
  logo_url        text,
  domain          text,                     -- "buet.ac.bd" — used for institutional email match
  is_active       boolean default true,
  created_at      timestamptz
)

-- 8.2 Departments (one university has many)
departments (
  id              uuid pk,
  university_id   uuid fk universities(id),
  name            text not null,            -- "Computer Science & Engineering"
  code            text,                     -- "CSE"
  is_active       boolean default true,
  unique(university_id, name)
)

-- 8.3 Profiles (extends Supabase auth.users)
profiles (
  id              uuid pk references auth.users(id) on delete cascade,
  role            user_role enum,           -- student | teacher | alumni
  full_name       text not null,
  handle          text unique not null,     -- URL slug, e.g. "rafi-cse-aust"
  email           text not null,            -- copied from auth.users for queries
  phone           text,                     -- optional
  is_phone_verified boolean default false,
  university_id   uuid fk universities(id) not null,
  department_id   uuid fk departments(id),
  student_id      text,                     -- e.g. "202114001"
  faculty_id      text,                     -- e.g. "F-1234"
  batch_year      smallint,                 -- admission year
  graduation_year smallint,                 -- for alumni
  current_company text,                     -- for alumni
  current_title   text,
  bio             text,
  avatar_url      text,
  social_links    jsonb default '{}',       -- {linkedin, github, ...}
  status          profile_status enum,     -- pending | verified | rejected | suspended
  rejection_reason text,
  verified_at     timestamptz,
  verified_by     uuid fk profiles(id),
  last_active_at  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  deleted_at      timestamptz
)

-- 8.4 Verification requests (audit trail of submission)
verification_requests (
  id                    uuid pk,
  profile_id            uuid fk profiles(id) on delete cascade,
  role                  user_role,
  id_card_front_path    text,             -- storage path, NOT URL
  id_card_back_path     text,
  supporting_doc_path   text,             -- for alumni: degree certificate
  selfie_with_id_path   text,             -- optional but recommended
  declared_university   text,             -- snapshot of declared name (vs. selected)
  declared_id_number    text,             -- the student/faculty ID they typed
  institutional_email   text,
  email_domain_match    boolean,          -- computed: ends with university.domain?
  submitted_at          timestamptz default now(),
  decided_at            timestamptz,
  decided_by            uuid fk profiles(id),
  decision              decision enum,    -- approved | rejected | pending
  decision_notes        text,
  ip_address            inet,
  user_agent            text
)

-- 8.5 Admin notes (internal, on a profile)
admin_notes (
  id          uuid pk,
  profile_id  uuid fk profiles(id),
  admin_id    uuid fk profiles(id),
  note        text,
  created_at  timestamptz default now()
)

-- 8.6 Connections (post-MVP)
connections (
  id              uuid pk,
  requester_id    uuid fk profiles(id),
  addressee_id    uuid fk profiles(id),
  status          connection_status enum,   -- pending | accepted | blocked
  created_at      timestamptz default now(),
  unique(requester_id, addressee_id)
)

-- 8.7 Audit log (immutable)
audit_log (
  id          bigserial pk,
  actor_id    uuid,                       -- who did it (null = system)
  action      text not null,              -- "verification.approved"
  target_type text,                       -- "profile" | "university" | "admin"
  target_id   uuid,
  metadata    jsonb default '{}',
  ip_address  inet,
  created_at  timestamptz default now()
)
```

### Enums (Postgres)

```sql
create type user_role        as enum ('student','teacher','alumni','admin','super_admin');
create type university_type  as enum ('public','private','national','madrasah','medical','other');
create type profile_status   as enum ('pending','verified','rejected','suspended');
create type decision         as enum ('pending','approved','rejected');
create type connection_status as enum ('pending','accepted','blocked');
```

### Row-Level Security (RLS) — Critical

```sql
-- Public can read only verified, non-deleted profiles (limited columns via view)
create policy "public_profiles_read" on profiles
  for select using (status = 'verified' and deleted_at is null);

-- Owner can update own profile (but NOT status, role, university — those are admin-only)
create policy "owner_update_profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Only admins can read ID card storage paths / verification requests
create policy "admin_only_verification" on verification_requests
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- Audit log: admins read, only service role writes
```

### Indexes (for search performance)

```sql
create index on profiles (university_id) where status = 'verified' and deleted_at is null;
create index on profiles (department_id) where status = 'verified';
create index on profiles (role) where status = 'verified';
create index on profiles (batch_year) where status = 'verified';
create index on profiles using gin (to_tsvector('simple', full_name || ' ' || coalesce(bio,'')));
```

---

## 9. Key User Flows

### 9.1 Student Registration

```
Landing → "Register" → Role chooser → [Student]
   → Step 1: Account (name, email, password)
   → Email verification link sent
   → Step 2: University (search + select, dept, student ID, batch year)
   → Step 3: ID proof (upload student ID card front/back)
   → Step 4: Optional extras (phone, bio, social links)
   → Review & submit
   → Status: PENDING
   → Email: "Your profile is awaiting admin verification (usually < 48h)"
   → Admin approves
   → Email: "Welcome to Gonix" + public profile URL
   → Profile is now discoverable
```

### 9.2 Teacher Registration

```
Similar to student, but:
  - Fields: faculty ID, designation (lecturer/Asst. Prof./Assoc. Prof./Professor)
  - Institutional email REQUIRED (warn if not @university.domain)
  - ID card: faculty ID card
  - Faster SLA target: < 24h
```

### 9.3 Alumni Registration

```
Same shell, but:
  - Fields: graduation year, last student ID, degree, current job (optional)
  - Proof: degree certificate OR last student ID card + NID (redacted)
  - Acceptable institutional email: alumni.* or personal
  - Slower SLA target: < 72h (harder to verify)
```

### 9.4 Admin Verification Flow (see Section 10)

---

## 10. Admin Verification Workflow

### Queue UI (the most important admin screen)

```
┌──────────────────────────────────────────────────────────────┐
│  Verification Queue                           [Filter ▾]    │
├──────────────────────────────────────────────────────────────┤
│ Submitted ▼  Role: All  University: All     47 pending       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┬────────────────────────────────────┐  │
│  │  ID Card         │  Rafi Ahmed — STUDENT              │  │
│  │  [Image preview] │  AUST · CSE · Batch 2023          │  │
│  │  zoom controls   │  Student ID: 202314001             │  │
│  │                  │  Email: rafi@aust.edu ✓ domain ok  │  │
│  │                  │  Submitted: 2h ago                 │  │
│  │                  │  IP: 103.59.x.x · BD ✓             │  │
│  │                  │  Risk flags: none                  │  │
│  │                  │  [Approve]  [Reject]  [Request more]│
│  └──────────────────┴────────────────────────────────────┘  │
│  ... next ...                                                │
└──────────────────────────────────────────────────────────────┘
```

### Risk Flags (auto-computed to assist human review)

| Flag | Logic |
|---|---|
| `email_domain_mismatch` | `institutional_email` doesn't end with `university.domain` |
| `no_institutional_email` | No `.edu.bd` / institutional email provided |
| `duplicate_id_number` | Same student/faculty ID already registered |
| `duplicate_id_image_hash` | Perceptual hash of ID card matches another submission (fraud ring) |
| `vpn_or_foreign_ip` | IP from outside BD or known VPN range |
| `rapid_resubmission` | Same user re-submitting after rejection > 2 times |
| `id_card_low_quality` | OCR confidence low / image too blurry |

> **The admin still makes the final call.** Flags are assistive, not auto-decisions.

### Admin Actions

- **Approve** → sets `profiles.status = 'verified'`, `verified_at`, `verified_by`, sends welcome email, audit log entry.
- **Reject** → requires a reason (template + free text), user notified, can re-submit once with new proof.
- **Request more info** → user gets email with a specific ask (e.g. "back of ID card is unclear").
- **Suspend** (post-verification) → for trust violations; reversible.

### Admin Dashboard Metrics (top of dashboard)

- Pending verifications (by age bucket: < 24h, 24-48h, > 48h)
- Approved / rejected this week
- Approval rate
- Average time-to-decision
- Top universities by registration volume
- Flagged submissions needing attention

---

## 11. Security, Privacy & BD Legal Compliance

This is the **highest-risk** part of the project. Get it right from day one.

### 11.1 Sensitive Data Classification

| Data | Sensitivity | Storage | Public Visibility |
|---|---|---|---|
| Email | PII | `profiles.email` | Owner-controlled toggle |
| Phone | PII | `profiles.phone` | Owner-controlled toggle |
| Student/Faculty ID | Sensitive PII | `profiles.student_id` | Hidden by default (last 4 only to connections) |
| **ID card image** | **Highly Sensitive PII** | `id-cards` bucket, **private**, encrypted at rest | Admin only via signed URL with audit log |
| Degree certificate | Sensitive PII | `id-cards` bucket, private | Admin only |
| Selfie with ID | Biometric-adjacent | Private, optional, auto-deleted after decision | Never |
| IP address | PII | `audit_log`, `verification_requests` | Admin only, retained 90 days |
| NID number (for alumni) | **Critical PII** | Encrypted column or NOT STORED — only used to look up then discarded | Never |

### 11.2 Bangladesh Personal Data Protection Ordinance, 2025 — Compliance Map

| Ordinance Requirement | How We Comply |
|---|---|
| Explicit, specific consent | Multi-step opt-in consent with granular checkboxes at registration; consent record stored with timestamp + version |
| Purpose limitation | Privacy policy states purposes (verification, directory, communication); no secondary use without re-consent |
| Data minimization | We collect only fields necessary for verification and the public profile |
| Storage limitation | ID card images deleted 90 days after decision (rejected) or 30 days after account deletion (verified users) |
| Right to access | Settings → "Download my data" generates a JSON export |
| Right to correction | Profile edit, admin can also correct on request |
| Right to erasure | Account deletion is hard-delete of PII; audit log retains action metadata but no PII |
| Data security | Encryption at rest (Supabase default) + in transit (TLS) + private storage buckets + signed URLs |
| Child data (<18) | Block registration; universities require 18+ for student IDs generally. Add explicit DOB gate with guardian consent for 16-17 |
| Data breach notification | Sentry + Supabase alerts; documented incident response plan |
| Data Protection Officer (DPO) | Designate a DPO (can be founder for MVP); email on privacy page |

### 11.3 Technical Security Controls

- **Auth**: Supabase Auth with strong password policy (min 10, mixed case, number, symbol), rate-limited login.
- **Session**: JWT, 1h access, refresh token rotation, secure httpOnly cookies.
- **RLS**: Deny by default; every table has explicit policies (see Section 8).
- **File uploads**: Server-side signed upload URLs; validate MIME, magic bytes, max size; strip EXIF (privacy).
- **ID card access**: Admin endpoints generate **short-lived (5 min) signed URLs**; every access logged to `audit_log` with admin ID + timestamp.
- **Perceptual hash** of ID card images stored (e.g. `pdqhash` via Edge Function) to detect duplicates.
- **Rate limits**: Registration endpoint: 3/hr per IP, 5/day per email. Login: 5 attempts/15min.
- **CSRF**: Server actions + SameSite=strict cookies; Origin/Referer validation.
- **Headers**: Strict CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
- **Secrets**: Vercel + Supabase env; never commit. Rotate keys quarterly.
- **Backups**: Supabase daily automated; weekly export to encrypted S3-compatible storage.
- **Pen test**: Schedule before public launch (e.g. Craw Security local BD firm, or BugBase).
- **Audit log**: Immutable (insert-only via RLS), streamed to Sentry for tamper alerts.

### 11.4 Abuse & Trust Safeguards

- Report profile button on every public profile → admin review queue.
- "Impersonation" report category → immediate profile freeze pending review.
- Ban list of universities known to be commonly forged.
- Honeypot fields in registration form (hidden `website` field; bots fill it → auto-reject).
- 2FA for admin accounts (mandatory from day one — use TOTP).

---

## 12. University Data Strategy

### Source

Bangladeshi universities list — there is **no single canonical public list**. Sources:
- University Grants Commission (UGC) Bangladesh — `ugc-universities.gov.bd/public-universities` and `/private-universities` (partial, sometimes outdated).
- Wikipedia + uniRank for cross-reference and gap-filling.

### Seeded Data (current)

`prisma/universities-data.ts` — exported as `ALL_UNIVERSITIES` and consumed by `prisma/seed.ts`.

- **59 public universities** (BUET, DU, RU, CU, BAU, JU, IU, SUST, KU, NU, BOU, BSMMU, BSMRAU, HSTU, MBSTU, PSTU, Sher-e-Bangla, CUET, RUET, KUET, DUET, NSTU, JnU, CoU, JKKNIU, CVASU, Sylhet Ag, JUST, PUST, BUP, BUTEX, BRUR, BSMRSTU, BarisalU, BMU, IAU, RmSTU, CMU, RMU, RUB, BSFMSTU, SMU, BDU, SHU-Netrokona, KAU, SHMU, BSMAAU, CSTU, SSTU, HAU, KAgU, TU-Thakurgaon, MU-Meherpur, BSMRU-Kishoreganj, NkU, KgU, JSTU, BSMRAU-Naogaon, PSTU-Pirojpur)
- **118 UGC-approved private universities** (NSU, BRACU, IUB, AUST, AIUB, EWU, UAP, NSU, etc. — full list in `universities-data.ts`)
- **3 international universities** (IUT, AUW, SAU-SA — South Asian University)
- **Total: 180 universities**

Schema fields: `name` (short, unique), `fullName`, `type` (`public` | `private` | `international`), `division`, `city`, `website`, `domain` (used for institutional email match), `slug` (unique, URL-safe).

### Approach

1. **Seeded with the 180-university list** (above).
2. Allow **admins to add/merge** universities when registrations come in for un-listed ones.
3. **Never let users create universities** — prevents typos becoming "ghost" institutions.
4. Each university has a `domain` (e.g. `buet.ac.bd`) used for institutional email validation.
5. Cache the list client-side; refresh weekly.

### Department Data

- Pre-seed top departments for the 11 biggest universities (BUET, DU, CUET, KUET, RUET, BRACU, NSU, IUB, AIUB, AUST, Daffodil).
- Allow user to type "Other" + free text → admin can promote to canonical department.

---

## 13. File & Asset Management

### Buckets

| Bucket | Visibility | Contents | Access |
|---|---|---|---|
| `id-cards` | **Private** | Student/faculty ID cards, degree certs, selfies | Admin only via 5-min signed URL |
| `avatars` | Public | Profile photos | Public read |
| `public-assets` | Public | University logos, marketing | Public read |

### Upload Pipeline

1. Client requests signed upload URL from `/api/upload/sign` (must be authenticated + have a `verification_request` row in `pending` state).
2. Client uploads directly to Supabase Storage.
3. Client receives storage path → saves to `verification_requests` row.
4. On admin decision: image is either soft-archived (verified) or hard-deleted (rejected + 90 days).

### Image Processing

- **Avatars**: client crops to 1:1, then Cloudinary delivers WebP at multiple sizes (`w_200,h_200,c_fill`).
- **ID cards**: stored as-uploaded, no Cloudinary (privacy — don't push PII to 3rd parties).

---

## 14. UI / UX Direction

### Visual Identity

- **Tone**: Trusted, institutional, modern. Not playful. Think: passport + LinkedIn + Notion.
- **Palette** (proposed, adapt to brand later):
  - Background: `#FFFFFF` / `#0A0A0A` (dark mode)
  - Primary: deep navy `#0B2545` (trust, academia)
  - Accent: emerald `#1A7F5A` (verified badge, success)
  - Warning: amber `#B7791F`
  - Error: crimson `#8B0000`
  - Text: `#0A0A0A` / `#FAFAFA`
- **Typography**:
  - Headings: `Hind Siliguri` for Bangla, `Inter` for English.
  - Body: `Inter` (English) / `Hind Siliguri` (Bangla).
- **Layout**: Generous whitespace; subtle 1px borders; rounded `lg` cards; soft shadows.

### Key Screens (described)

1. **Landing** — Hero with 3 role cards (Student / Teacher / Alumni) + count of verified members + recent universities.
2. **Role chooser** — 3 large cards, clear "what you need to register" preview.
3. **Multi-step registration** — progress bar at top, single field per step, save-and-resume.
4. **Awaiting verification** — friendly state with timeline estimate + "what's next" + resend email link.
5. **Public profile** — avatar, name, verified badge, role chip, university chip, dept, batch, bio, social links. **ID card and student ID are NEVER shown publicly.**
6. **Admin verification queue** — keyboard-navigable (J/K to next, A/R to decide), image side-by-side with metadata.
7. **Search results** — card grid, filters in left rail (role, uni, dept, batch), infinite scroll.

### Accessibility

- WCAG 2.1 AA: contrast ratios, focus rings, ARIA, keyboard nav.
- Mobile-first (60%+ traffic will be on 3G/4G in BD).
- Skeleton loaders, not spinners.
- Image `alt` for all avatars (decorative if no name, but we always have a name).

---

## 15. Email & Notification System

### Transactional Email Templates (Resend + react-email)

| Event | Template | Trigger |
|---|---|---|
| Welcome + verify email | `verify-email.tsx` | Registration step 1 |
| Registration submitted | `registration-submitted.tsx` | After all 4 steps complete |
| Verification approved | `verification-approved.tsx` | Admin clicks Approve |
| Verification rejected | `verification-rejected.tsx` | Admin clicks Reject |
| More info requested | `verification-info-requested.tsx` | Admin asks for more |
| Welcome (post-approval) | `welcome-to-portal.tsx` | Same as approved, with onboarding |
| Password reset | `password-reset.tsx` | Supabase default |
| New connection request | `connection-request.tsx` | Post-MVP |
| Weekly digest | `weekly-digest.tsx` | New people from your university |

### In-App Notifications

Stored in `notifications` table (post-MVP); for MVP, email-only is fine.

### Anti-Spam

- All transactional emails via Resend authenticated domain (`mail.tsportal.bd`).
- DKIM + SPF + DMARC configured.
- Suppression list for bounces/complaints.

---

## 16. Internationalization (Bangla + English)

### Strategy

- **i18n library**: `next-intl` (App Router compatible, RSC support).
- **Default locale**: `en`; `bn` available from day one but UI is English-first.
- **Content the user can write** (bio, posts) stored as-is; UI is the only thing translated.
- **Names**: stored in original script (Bangla or Latin), displayed as written.
- **URLs**: `/en/...` and `/bn/...` prefixed; root `/` redirects based on `Accept-Language` header.

---

## 17. Development Phases & Timeline

> **Assumption**: 1 full-stack developer (you) + 1 designer part-time. Adjust if more.

### Phase 0 — Setup (Week 1)
- [ ] Repo init, Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Supabase project (free tier for dev)
- [ ] Vercel project + env vars
- [ ] Cloudinary account
- [ ] Resend account + domain auth
- [ ] Sentry + Plausible
- [ ] GitHub Actions: lint + typecheck + test on PR
- [ ] Design tokens in `tailwind.config.ts`
- [ ] Database schema migrations (Section 8)
- [ ] Seed universities (top 200)
- [ ] RLS policies
- [ ] Local Supabase stack via `supabase start`

### Phase 1 — Auth & User Model (Week 2)
- [ ] Supabase Auth wiring (email + Google)
- [ ] Login / register / verify-email pages
- [ ] Auth middleware for protected routes
- [ ] Role chooser page
- [ ] `profiles` table + auto-insert on first login

### Phase 2 — Registration Wizard (Weeks 3–4)
- [ ] Multi-step form with Zustand persistence
- [ ] Student flow end-to-end
- [ ] Teacher flow end-to-end
- [ ] Alumni flow end-to-end
- [ ] Client-side image compression (browser-image-compression)
- [ ] Server-side signed upload URLs
- [ ] `verification_requests` insert
- [ ] Email: "submission received"

### Phase 3 — Admin Verification (Weeks 5–6)
- [ ] `/admin` layout + role guard
- [ ] Verification queue page (paginated, filterable)
- [ ] ID card viewer (signed URL + zoom)
- [ ] Approve / Reject / Request more actions
- [ ] Email notifications on decision
- [ ] Risk flag computation
- [ ] Audit log writes
- [ ] Admin dashboard metrics
- [ ] 2FA enforcement for admin accounts

### Phase 4 — Profiles & Directory (Weeks 7–8)
- [ ] Public profile page `/u/[handle]`
- [ ] Edit profile (with privacy toggles)
- [ ] Avatar upload to Cloudinary
- [ ] Search page with filters
- [ ] University pages `/universities/[slug]`
- [ ] Department pages `/universities/[slug]/[dept]`
- [ ] SEO metadata (`generateMetadata` per profile)
- [ ] Sitemap + robots.txt
- [ ] Skeleton loaders

### Phase 5 — Polish & Trust (Weeks 9–10)
- [ ] Account deletion flow (right to erasure)
- [ ] Data export (right to access)
- [ ] Consent management UI (granular toggles)
- [ ] Privacy policy + Terms of Service (lawyer review)
- [ ] Consent banner for cookies (Plausible is cookieless, but be explicit)
- [ ] Perceptual hash of ID cards (Edge Function)
- [ ] Rate limiting on registration
- [ ] Honeypot fields
- [ ] CSP, HSTS, all security headers
- [ ] Error monitoring with Sentry

### Phase 6 — Beta & Launch (Weeks 11–12)
- [ ] Internal dogfooding with 10 friendly users
- [ ] Beta with 100 users from 5 universities
- [ ] Performance: LCP < 1.5s, FID < 50ms
- [ ] Penetration test (or at minimum, OWASP top-10 review)
- [ ] DPO designation
- [ ] Incident response runbook
- [ ] Soft launch on social media
- [ ] Public launch

### Phase 7 — Post-MVP (Weeks 13+)
- Connections + follow
- 1:1 messaging (with abuse reporting)
- Posts feed
- Job board
- Auto-verify via university APIs (BUBT, Presidency, etc.)
- Bangla UI full coverage
- Mobile app (Expo / React Native)

### Total Timeline Summary

| Phase | Weeks | Outcome |
|---|---|---|
| 0–6 (MVP) | 12 | Production-ready verified directory + admin |
| 7 (Post-MVP) | 4+ | Social features |

**Realistic calendar: ~3 months to MVP, ~6 months to "complete v1".**

---

## 18. Cost Estimation (Monthly, at modest scale)

| Service | Free Tier | Expected (1k users) | Expected (10k users) |
|---|---|---|---|
| Vercel | Free (hobby) | $0–20 | $20–150 |
| Supabase | 500 MB DB, 1 GB storage | $0–25 | $25–100 |
| Cloudinary | 25 credits/mo | $0 | $50–100 |
| Resend | 3k emails/mo | $0 | $20 |
| Sentry | 5k events/mo | $0 | $26 |
| Plausible | (self-host or $9/mo) | $9 | $19 |
| Domain + email auth | — | $15/yr | $15/yr |
| Pen test (one-time) | — | $0 (DIY checklist) | $500–2000 |
| **Total** | | **~$30–60 / mo** | **~$160–430 / mo** |

> Free tier comfortably supports the first **~500 verified users**. Cost is not a constraint at MVP.

---

## 19. Risks & Mitigation

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Admin verification becomes a bottleneck at scale | High | High | Multi-admin from day 1; SLA dashboards; future: university self-serve |
| 2 | Fraudsters register with stolen/forged ID cards | High | High | Perceptual hash dedup, IP rate limits, slow-roll by university, manual review |
| 3 | BD DPA Ordinance 2025 compliance gaps | Medium | Critical (legal) | Lawyer review, DPO, consent flows, data minimization, retention policy |
| 4 | Low initial supply of verified profiles (cold start) | High | High | University partnerships; batch-onboard clubs; alumni chapter admins; seeded demo profiles |
| 5 | PII leak via ID card bucket misconfiguration | Low | Critical | Private bucket only; signed URLs; access logged; security audit before launch |
| 6 | Abuse: harassment via direct messages | Medium | High | Block/report, content moderation queue, no DMs in MVP (defer to phase 2) |
| 7 | Email deliverability to BD inboxes | Medium | Medium | Resend with authenticated domain; warm up; SPF/DKIM/DMARC; monitor bounces |
| 8 | University domain validation false positives | Medium | Low | Allow manual admin override; multiple-domain per university (e.g. `buet.ac.bd` + `ugc.edu` mailings) |
| 9 | Impersonation of real public figures | Medium | High | Cross-reference with university website, require institutional email, faster SLA for teachers |
| 10 | Supabase / Vercel outage | Low | Medium | Status page comms, queued writes, progressive enhancement |
| 11 | Data retention policy not enforced → storage cost + legal risk | Medium | Medium | Cron job purges ID cards per retention rule; alerts on bucket size |
| 12 | Founder burnout from manual verification | High | Medium | Hire part-time verifier at 100+ pending/week; train university liaisons |

---

## 20. Success Metrics

### North Star
**Weekly Active Verified Users (WAVU)**

### MVP KPIs (first 90 days post-launch)

| Metric | Target |
|---|---|
| Verified profiles created | 500 |
| Universities with ≥ 1 verified member | 30 |
| Median time-to-verification | < 24h |
| Verification approval rate | 60–75% (too high = fraud, too low = bad UX) |
| 30-day verified-user retention | > 40% |
| Profile completion rate (after approval) | > 60% add bio + social link |
| Search → profile view → connection request (post-MVP) | funnel tracked |

### Trust KPIs
- **0** public PII leaks
- **< 0.5%** verified profiles later suspended for fraud
- **> 90%** of users would recommend (quarterly NPS)

---

## 21. Open Questions / Decisions Needed

1. **Project name**: "Gonix" is a working name. Better options: *Shikha* (শিখা), *Chetona* (চেতনা), *Milemates*, *CampusID*, *UniCircle*. Need to pick before domain purchase.
2. **Domain**: `tsportal.bd`? `tsportal.com.bd`? (`.com.bd` is free, `.bd` is paid)
3. **Founder verification authority**: Who are the first admins? Trusted friends? University liaisons?
4. **University partnerships**: Pursue formal MOUs with 2–3 unis for the launch? Or stay solo?
5. **Pricing model**: Free forever, or freemium (verified = free, recruiter access = paid)?
6. **Open-source**: Build privately or open-source the core (huge trust signal in BD)? Trade-off: spam risk vs. credibility.
7. **Legal entity**: Sole proprietorship vs. registered company (needed for payment processing later).
8. **Alumni proof**: Acceptable alternatives to degree cert (e.g., final transcript screenshot, LinkedIn cross-check)?
9. **Telegram/WhatsApp integration**: For BD, a Telegram bot for status checks would be very high-impact.
10. **Data retention period**: 90 days for rejected ID cards — too short? Confirm with lawyer.
11. **Identity proof for teachers from madrasah / non-traditional unis**: How strict?

---

## 22. Recommended Next Steps

If you (the user) approve this plan, here is the ordered punch list for **this week**:

1. **Confirm scope** — review Sections 1, 5, 9. Lock in MVP = Students + Teachers + Alumni with verified directory.
2. **Pick a name** — affects domain, branding, legal entity.
3. **Buy domain + Resend subdomain** — `tsportal.com.bd` (free at BTCL) + `mail.tsportal.com.bd`.
4. **Create Supabase project** (free tier).
5. **Create Vercel project**, link to a new GitHub repo.
6. **Initialize Next.js + TypeScript + Tailwind**.
7. **Draft privacy policy + terms** with a BD-tech-savvy lawyer (estimate ৳20–50k one-time).
8. **Start Phase 0** from Section 17.

---

## 23. Appendix: Research Notes

### A. Bangladeshi University ID Format Variability (research finding)

There is **no single standard**. Observed formats:

| University | Format | Example |
|---|---|---|
| BUET | Numeric, ~7 digits | `0401017` |
| DU (Dhaka Univ.) | 7 digits | `2120201` |
| AUST | Year+dept+roll | `202314001` |
| BRAC University | Year+prog+roll | `21241001` |
| BUBT | 11 digits | (see their public API) |
| Presidency University | 18 digits | `000000000000000000` |
| Daffodil | `111-11-1111` or `024200…` | varies |
| National University (affiliated colleges) | 10 digits | `2526103001` |
| IUT | Email-gated | (no public format) |

**Implication**: We **cannot** validate ID format. We must:
- Store as free text (validated only by `is_numeric` for numeric universities, optional).
- Rely on **admin visual review** of the ID card.
- Match by `university.domain` for email-based auto-checks.

**Implication 2**: A future "auto-verify" feature must be per-university API integration. BUBT and Presidency have public endpoints; we can build a registry of supported APIs and add per-uni.

### B. Auto-Verification Possibility (Phase 3+)

Universities with public ID verification APIs (as of 2025):
- BUBT — `https://bubt.edu.bd/global_file/getData.php?id=$id&type=stdVerify`
- Presidency University — `https://sims.pu.edu.bd/verify/studentId`
- Likely others; needs per-discovery.

We can build a `university_verification_apis` table:
```sql
university_verification_apis (
  university_id   uuid pk fk universities(id),
  api_url_template text,
  api_type        text,                 -- 'bubt' | 'presidency' | 'custom'
  field_mapping   jsonb,
  is_active       boolean,
  last_tested_at  timestamptz,
  success_count   int,
  failure_count   int
)
```
For universities with active APIs, we can offer **instant verification** (still logged to audit trail); fall back to manual otherwise.

### C. Similar Existing Projects (for reference, not to copy)

| Project | URL | Notes |
|---|---|---|
| EduAuth Registry | `github.com/litch07/eduauth-registry` | Certificate-focused, similar admin approval workflow |
| BUBT ID Verify API | `github.com/itsrafsanjani/bubt-id-verification-api` | Per-uni API demo |
| BetterSIS (IUT) | `github.com/akibhaider/BetterSIS` | Single-uni SIS, email-restricted |
| BDCMIS | `bdcmis.com` | College management, paid SaaS |

**Gap Gonix fills**: pan-BD, multi-audience (students + teachers + alumni), identity-verified directory.

### D. Bangladesh Legal References

- **Personal Data Protection Ordinance, 2025** (Ordinance No. 61 of 2025) — primary data law. Key: consent, purpose limitation, sensitive data (NID, biometric), child data, breach notification.
- **Digital Security Act 2018** — relevant if any content moderation issues arise (defamation, "fake news").
- **ICT Act 2006 (amended 2013)** — cybercrime, hacking.
- **UGC Act 2018** — university data sharing (relevant for future partnerships).

> **Action**: Hire a BD lawyer familiar with tech / data law for the privacy policy + ToS review. Budget ৳20,000–50,000.

### E. Tooling Cheat Sheet

```bash
# Initialize
npx create-next-app@latest ts-portal --typescript --tailwind --app --src-dir

# Supabase local stack
brew install supabase/tap/supabase   # macOS
# or scoop install supabase          # Windows
supabase init
supabase start
supabase db push
supabase gen types typescript --local > src/types/supabase.ts

# Useful libraries
npm i @supabase/ssr @supabase/supabase-js
npm i zustand react-hook-form zod @hookform/resolvers
npm i framer-motion
npm i next-intl
npm i resend react-email @react-email/components
npm i browser-image-compression
npm i shadcn-ui  # then npx shadcn-ui@latest init
```

---

**End of Plan**

> This document is the source of truth for project decisions. Update it as decisions are made. Suggested location: `D:\TS Portal\PROJECT_PLAN.md` (this file) and a shorter `README.md` in the repo root.
