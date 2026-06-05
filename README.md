# Gonix — Verified Academic Network for Bangladesh

A trusted portal for **Students, Teachers, and Alumni** of Bangladeshi universities.
Every profile is gated by admin-verified identity (university ID + ID card image).

> **Status**: Local MVP. Runs out-of-the-box on SQLite. Designed to migrate to Supabase (Postgres + Auth + Storage) for production.

---

## Quickstart

```bash
# 1. Install
npm install

# 2. Initialize the database
npm run db:push        # creates SQLite schema
npm run db:seed        # seeds 180 BD universities + demo accounts

# 3. Run
npm run dev            # http://localhost:3000
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| **Super admin** | `admin@tsportal.bd` | `admin123` |
| Student (verified) | `rafi@tsportal.bd` | `demo1234` |
| Teacher (verified) | `nazia@tsportal.bd` | `demo1234` |
| Alumni (verified) | `tasnim@tsportal.bd` | `demo1234` |
| Student (pending) | `sadia@tsportal.bd` | `demo1234` |

### Try the flow

1. **As `sadia`** → see "Awaiting admin verification" dashboard.
2. **As `admin`** → `/admin/verifications` → click Sadia's submission → review the ID card → Approve.
3. **As `sadia` again** → refresh dashboard → "Your profile is live" → visit `/u/sadia-aust`.
4. **Visit `/search`** → filter by university / role / batch → see verified members.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma** + **SQLite** (local) — swap to Supabase Postgres in production
- **NextAuth v4** with Credentials provider, JWT sessions
- **Tailwind CSS** + custom design system
- **react-hook-form** + **zod** for validation
- **react-hot-toast** for notifications
- **Local file storage** (`./uploads/`) — swap to Supabase Storage in production
- **Mock email** (console log) — wire Resend/SendGrid for production

## Architecture

See `PROJECT_PLAN.md` for the full plan, BD legal compliance, and roadmap.

## Key flows implemented

- ✅ Single-page sign-up at `/signup` (role tabs, password strength, image dropzone)
- ✅ Multi-step registration (Student / Teacher / Alumni) — original three-flow experience at `/register`
- ✅ File upload (ID card front + back, with image preview & validation)
- ✅ Admin verification queue with image viewer
- ✅ Approve / Reject / Request more info
- ✅ Risk flags (over-48h, domain mismatch, etc.)
- ✅ Public profiles with privacy toggles
- ✅ Search & filter (role, university, department, batch)
- ✅ University directory (180 institutions) and per-university pages
- ✅ Blog (feed-first home, PostCard, PostBody markdown-ish, admin can hide)
- ✅ Admin dashboard with metrics
- ✅ User management with search
- ✅ Audit log for admin actions (incl. ID card access)
- ✅ Account deletion (right to erasure)

## Production migration path

The project is Vercel-ready. To go live on Vercel you only need to swap the things that cannot survive serverless:

1. **DB (Supabase Postgres)**: Schema is `postgresql` with `directUrl`. The `build` script (`prisma generate && prisma migrate deploy && next build`) runs pending migrations automatically on every Vercel deploy — no manual migration step needed. You only need to run `npm run db:seed` **once** after the first deploy to populate universities + the admin account.
2. **Auth**: `trustHost: true` is enabled in `src/lib/auth.ts` — NextAuth works on Vercel out of the box. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (Vercel sets `VERCEL` automatically).
3. **Storage (Supabase Storage)**: `src/lib/storage.ts` is env-aware. Set `STORAGE_BACKEND=supabase` + the Supabase env vars. **Important:** create the bucket as **PUBLIC** in the Supabase dashboard — the current code uses `getPublicUrl()` which only works with public buckets. (For a future security upgrade, refactor to signed URLs so ID cards can be served from a private bucket — see `STORAGE_SECURITY_TODO` below.)
4. **Email**: `src/lib/email.ts` is env-aware. Local dev logs to stdout. Set `EMAIL_BACKEND=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` to send real emails via Resend.
5. **Build safety**: Every page that touches the database has `export const dynamic = "force-dynamic"` so Next.js never tries to query the DB at build time. This is why the Vercel build completes even without runtime DB access.
6. **Images**: `next.config.js` auto-detects the Supabase storage domain from `NEXT_PUBLIC_SUPABASE_URL` at build time, so `<Image>` works for Supabase-hosted files without any extra config.
7. **Legal**: Lawyer review of privacy policy + ToS against Bangladesh Personal Data Protection Ordinance, 2025.

## Supabase + Vercel setup

End-to-end walkthrough: from a fresh Supabase project to a deployed Gonix on Vercel.

### 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. **Region**: pick **Singapore (`ap-southeast-1`)** to match your Vercel `sin1` region in `vercel.json` — keeps DB ↔ app latency low.
3. Set a strong database password (save it somewhere safe — you'll need it for the connection string).
4. Wait ~2 minutes for provisioning.

### 2. Grab the connection strings

Supabase Dashboard → your project → **Settings → Database → Connection string**.

You'll see three sections. You need two:

| Env var | Section | Port | Used by |
|---|---|---|---|
| `DATABASE_URL` | **Transaction pooler** | `6543` | Vercel serverless runtime + local Prisma queries |
| `DIRECT_URL` | **Direct connection** | `5432` | `prisma migrate`, `prisma db push`, Prisma Studio |

Copy the **URI** format for both. The strings look like:

```
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

> The `?pgbouncer=true&connection_limit=1` on `DATABASE_URL` is critical — Supabase's pooler runs in transaction mode, which doesn't support Prisma's prepared statements without these flags.

### 3. Grab the API keys

Supabase Dashboard → **Settings → API**.

- `NEXT_PUBLIC_SUPABASE_URL` → **Project URL** (`https://[PROJECT_REF].supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` → **`service_role` secret** (server-only — never expose to the client; bypasses RLS)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **`anon` public** key (safe to expose, respects RLS) — only needed if you later add client-side Supabase calls

### 4. Create the storage bucket

Supabase Dashboard → **Storage → New bucket**.

- Name: `payment-proofs` (must match `SUPABASE_STORAGE_BUCKET` exactly)
- **Public bucket: ON** ← toggle this ON (the current `src/lib/storage.ts` uses `getPublicUrl()` which only works for public buckets)
- Click **Create bucket**

> ⚠️ **Security note:** A public bucket means anyone with the file URL can view the file. For ID cards (sensitive), this is a privacy risk. A future refactor should switch to signed URLs so the bucket can stay private. For now, public is the path of least resistance to a working deployment. To upgrade later, see the `STORAGE_SECURITY_TODO` section at the bottom of this README.

### 5. Wire your local `.env`

Copy `.env.example` to `.env` and fill in the Supabase values:

```bash
cp .env.example .env
# then edit .env and replace the placeholders
```

Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

Paste it as `NEXTAUTH_SECRET`. Leave `NEXTAUTH_URL="http://localhost:3000"` for now.

### 6. Apply the schema and seed

```bash
npm install                        # runs prisma generate via postinstall
npx prisma migrate dev --name init  # creates initial migration + applies it to Supabase
npm run db:seed                    # seeds universities, departments, admin account
```

You should now see all the tables in **Supabase Dashboard → Table Editor** (`Profile`, `University`, `Department`, `Post`, `Session`, `Account`, `VerificationRequest`, `AdminNote`, `AuditLog`).

### 7. Smoke-test locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, log in, upload an ID card — the file should land in your Supabase bucket. If uploads fail, double-check the bucket name matches `SUPABASE_STORAGE_BUCKET` exactly.

### 8. Push to GitHub

```bash
git init                       # if not already a repo
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gonix.git
git push -u origin main
```

### 9. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. Framework auto-detected: **Next.js**. No config changes needed — `vercel.json` is already committed.
3. **Environment Variables** — add the following for **Production** (and optionally Preview/Development). You can paste them from your `.env`:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Supabase pooled URI (port 6543, with `?pgbouncer=true&connection_limit=1`) |
   | `DIRECT_URL` | Supabase direct URI (port 5432) |
   | `NEXTAUTH_SECRET` | the `openssl rand -base64 32` value |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` (or your custom domain) |
   | `STORAGE_BACKEND` | `supabase` |
   | `SUPABASE_URL` | `https://[PROJECT_REF].supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` secret |
   | `SUPABASE_STORAGE_BUCKET` | `payment-proofs` |
   | `NEXT_PUBLIC_SUPABASE_URL` | same as `SUPABASE_URL` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon` public key |
   | `NEXT_PUBLIC_APP_NAME` | `Gonix` |
   | *(optional)* `EMAIL_BACKEND` | `resend` |
   | *(optional)* `RESEND_API_KEY` | `re_xxx` |
   | *(optional)* `EMAIL_FROM` | `Gonix <noreply@your-domain.com>` |

4. Click **Deploy**. Vercel runs `npm install` (→ `prisma generate` via `postinstall`) → `npm run build` (→ `prisma generate && prisma migrate deploy && next build`).
   - **`prisma migrate deploy` runs against your production Supabase automatically** — pending migrations are applied on every deploy. No manual step needed.
   - All DB pages are `force-dynamic`, so the build never tries to query the DB — it completes even if the DB is briefly unreachable.
5. After the first successful deploy, copy your real Vercel URL (e.g. `https://gonix-abc123.vercel.app`) and update the `NEXTAUTH_URL` env var in Vercel, then **Redeploy** from the Deployments tab. NextAuth needs the correct callback URL.
6. **Seed the production database once.** From your machine, with your local `.env` pointing at Supabase:
   ```bash
   npm run db:seed
   ```
   This populates universities, departments, and the admin account in the same Supabase instance your Vercel deployment uses.

### 10. Future schema changes

When you edit `prisma/schema.prisma` (add a column, new model, index, etc.):

```bash
npx prisma migrate dev --name add_whatever    # local: creates migration + applies to Supabase
git add prisma/migrations
git commit -m "feat(db): add whatever"
git push                                        # Vercel auto-deploys
```

**The new migration is applied to production automatically** by the `prisma migrate deploy` step in the `build` script. No manual deploy step needed. (`prisma migrate deploy` is safe — it only applies pending migrations, never resets data.)

## Deploying to Vercel (quick reference)

1. **Push to GitHub** and import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js.
2. **Set environment variables** in *Project → Settings → Environment Variables* (Production, Preview, Development as needed). See the table in step 9 above.
3. **Build settings** (auto-detected, but verify):
   - Build command: `npm run build` (runs `prisma generate` first via the `build` script; `postinstall` also runs `prisma generate`)
   - Output: `.next` (default)
4. **Deploy.** Vercel will run `npm install` (which runs `prisma generate` via `postinstall`) and then `npm run build`.

### Known Vercel constraints (intentional, fixed later)

- **Local file storage doesn't persist** — uploads are lost between invocations. `STORAGE_BACKEND=supabase` (or `vercel-blob`) is required for real uploads.
- **Email is console-only by default** — no emails go out on Vercel until `EMAIL_BACKEND=resend` + `RESEND_API_KEY` is set.
- **Cold starts** — first request after idle may take 1–3s on the free tier. Upgrade to Vercel Pro for faster cold starts.

## Useful commands

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # run prod build
npm run db:reset    # nuke & re-seed
npm run db:studio   # Prisma Studio (browse the DB)
npm run lint        # ESLint
```

---

## STORAGE_SECURITY_TODO (signed URLs for private bucket)

The current `src/lib/storage.ts` uses `getPublicUrl()`, which requires the Supabase bucket to be **public**. This means anyone with the file URL can view uploaded ID cards — a privacy concern under Bangladesh's data protection law.

**To upgrade to signed URLs (private bucket, secure access):**

1. Change `saveSupabase` in `src/lib/storage.ts` to return the object path instead of a public URL:
   ```ts
   return { relPath: objectPath, absPath: null, size: buf.length, mime: file.type };
   ```
2. Update `resolveUploadUrl` to generate a signed URL with a 1-hour expiration:
   ```ts
   const { data, error } = await supabase.storage
     .from(bucket)
     .createSignedUrl(relPath, 3600);
   return data?.signedUrl || null;
   ```
3. Make the bucket **PRIVATE** in the Supabase dashboard (Settings → Storage → [bucket] → toggle Public OFF).
4. Update all display code that uses `avatarUrl` or `idCardFrontPath` etc. to call `resolveUploadUrl()` before rendering, so the path is resolved to a fresh signed URL at request time.
5. Re-deploy.

This is a non-trivial refactor (touches every component that displays uploaded images) but is the right thing for production with sensitive data. Track it as a follow-up after the initial launch.

---

Built for trust. Built for Bangladesh. 🇧🇩
