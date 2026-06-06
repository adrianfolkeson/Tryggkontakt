# TryggKontakt

**En lugn plats för kommunikation och stöd kring vardagen.**

TryggKontakt is a Swedish-language structured daily journal for families and care professionals supporting people with Down syndrome, autism, and intellectual disabilities. It replaces ad-hoc phone calls, scattered chat threads, and paper handover notes with a single calm surface that the family controls.

## Status

Production-deployed pre-launch. Currently in pre-launch partnerships discussion. Not yet open to the public.

## Live

https://www.tryggkontakt.se

## What it is

The product is built around a **krets** ("circle") — one person at the center, surrounded by the people who support them. Relatives manage the krets and invite assistants, school staff, and coordinators with time-bounded memberships. Each role sees only what the family has allowed it to see.

The daily journal is **slot-based**: structured short updates for morning, lunch, and afternoon, plus a free-form *Snabbnotering* (quick note) stream for everything that doesn't fit a slot. Each update can be marked *Bara anhöriga* — visible only to relatives, hidden from staff and coordinators — so the family always has a private channel even within a shared krets.

A PDF export bundles a date range of updates, schedule items, and reminders into a single printable file for doctor visits or annual reviews. All data lives in the EU. RLS is the source of truth for permissions; there is no admin panel, no global staff view, no marketing pixel, and no analytics.

## Tech stack

- Next.js 16 (App Router, RSC, Server Actions)
- TypeScript (strict mode)
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel (Frankfurt region, `fra1`)
- Resend (transactional email)
- `@react-pdf/renderer` (PDF export)

## Architecture overview

- **Krets data model.** `person` (one row per supported individual) ← `circle` ← `circle_member` (time-bounded: every membership has `valid_from` and an optional `valid_to`). A user is "active" in a krets only while `valid_from <= now() < valid_to`. Revoking access sets `valid_to = now()`; the row is retained for audit, not deleted.
- **Roles.** `relative` (admin — controls invitations and revocations), `staff` (assistants, day-to-day journal writers), `school` (teachers — read-mostly), `coordinator` (samordnare — case-level read).
- **RLS.** Per-row visibility enforced in Postgres. Helpers like `is_active_circle_member(circle_id)` and `has_active_circle_role(circle_id, role[])` are reused across every table policy. The client cannot bypass RLS; privileged operations (e.g. revoking a member) go through SECURITY DEFINER RPCs with explicit `auth.uid()` checks.
- **Auth.** Magic-link only (no passwords). PKCE flow with cookie propagation handled via `@supabase/ssr`. There is no in-app password concept anywhere.
- **Server actions for mutations.** No REST API surface. The only `/api/*` routes are PDF export, GDPR data export, and email/auth webhooks.
- **Stockholm timezone.** All slot/day boundaries are computed in `Europe/Stockholm`. Helpers live in `lib/stockholm.ts` (`stockholmDateStr`, `parseStockholmDateTime`, `addDaysToDateStr`) and are DST-safe.
- **Key routes.** `/app/*` is gated by `proxy.ts`; `/sign-in`, `/inbjudan/[token]`, `/integritet`, `/villkor`, `/auth/confirm` are public.

## Setup

```bash
git clone git@github.com:adrianfolkeson/Tryggkontakt.git
cd Tryggkontakt
npm install
cp .env.example .env.local
# Fill in the variables documented below.
supabase start
supabase db reset    # applies all migrations to the local DB
npm run dev
```

The dev server runs on `http://localhost:3000`. Local Supabase Studio is at `http://localhost:54323`.

## Environment variables

| Name | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Public — embedded in client bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Sent to the client; RLS still applies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only key. **Never** ship to the browser. Used only inside server actions for operations that must bypass RLS (e.g. circle bootstrap via the `create_first_circle` RPC). |
| `RESEND_API_KEY` | Resend API key for transactional email (invitations, etc.). |
| `RESEND_FROM_EMAIL` | Verified sending address, e.g. `no-reply@tryggkontakt.se`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in invitation links and magic-link callbacks. Production: `https://www.tryggkontakt.se`. |

`.env.local` is gitignored; never commit secrets.

## Database

- Postgres via Supabase. Schema lives entirely in SQL migrations under `supabase/migrations/`.
- Naming: `YYYYMMDDHHMMSS_<short_description>.sql`. New migrations are additive; renames and column drops require explicit review.
- Apply locally with `supabase db reset` (destructive — wipes local data and re-runs all migrations).
- Apply to remote with `supabase db push`. Always run the smoke tests (below) locally first.

## Development workflow

1. Branch from `main` and plan the change before writing code (plan-first, per `CLAUDE.md`).
2. Make the smallest change that satisfies the requirement; remove scope where possible.
3. Run static and database checks locally:

   ```bash
   npx tsc --noEmit
   npm run lint
   # Plus the RLS smokes — see Testing below.
   ```
4. Commit with a descriptive message. Migration commits separate from UI commits when practical.
5. Push to `main` → Vercel auto-deploys to production. Migration goes out via `supabase db push` after the UI has been merged and verified locally.

## Conventions

- English in code, commits, file paths, and comments. Swedish in all user-facing copy, error messages, and seed data.
- Server components by default; client components only where interactivity requires it.
- Server actions live in `actions.ts` files colocated with the route they serve.
- One file, one responsibility. ~200 lines is the soft split point.
- No premature abstraction. Three concrete uses before extracting a helper.
- RLS is the source of truth. Never bypass it from the client. If a flow needs privileged access, write a SECURITY DEFINER RPC with an explicit `auth.uid()` check.
- `prefers-reduced-motion` respected globally via `globals.css`.
- Stockholm time handled exclusively through `lib/stockholm.ts` helpers — never via `Date` arithmetic in routes.

## Testing

- **Static:** `npx tsc --noEmit` and `npm run lint`.
- **Database / RLS:** SQL smokes live in `supabase/tests/`. They wrap every assertion in `BEGIN; ... ROLLBACK;` and use a tiny `pg_temp.test_assert` helper that raises NOTICE on PASS and EXCEPTION on FAIL. Run individually:

  ```bash
  docker exec supabase_db_TryggKontakt \
    psql -U postgres -d postgres -f /tmp/<test>.sql
  ```

  Files cover initial schema RLS, the slot-based daily update CHECK, circle invites, daily update visibility, reminders, schedule items, account deletion, default visibility, member revocation, and text-size preferences.
- **End-to-end smokes:** manual against `npm run dev` — sign in, create an update, export PDF, exercise the relevant new flow.

## Deployment

- Production deploys come from `main` via Vercel.
- Region: `fra1` (Frankfurt), co-located with Supabase `eu-central-1`.
- Migrations are applied to the remote DB via `supabase db push` after local verification. Never push a migration before the corresponding UI is on `main`.
- Production environment variables are managed in the Vercel dashboard. Preview deployments inherit them.

## Documentation

- **`PROJECT.md`** — product specification, in Swedish. The single source of truth for what we build and why.
- **`DESIGN.md`** — design system: tokens, typography, components, screen patterns.
- **`CLAUDE.md`** — working agreement for AI-assisted development on this repo.

## License

Proprietary — © 2026 Aurora Ecom AB. All rights reserved.

## Contact

info@auroraecom.se
