# XP-Tracker

A gamified goal tracker. Set real-life **Goals**, break them into **Habits**,
**Dailies**, and **To-dos**, and earn XP, Gold, and levels as you complete
them. Missing a scheduled Daily costs HP. Spend earned Gold on rewards you
define for yourself in the **Shop**. Every change is logged to **History**,
and To-do/Daily completions can be undone.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Prisma 7 (driver-adapter
based, `@prisma/adapter-pg`) over Postgres, Auth.js v5 (email+password, with
optional Google OAuth), Vitest for the XP/level and timezone math. See
`prisma/schema.prisma` for the full data model.

No paid third-party service is required anywhere - see the Security section
of the original plan for details.

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get a Postgres database.** Sign up for your own free account directly at
   [neon.tech](https://neon.tech) (or [supabase.com](https://supabase.com) -
   any standard Postgres works) - not through a Vercel Marketplace billing
   integration, so no card is ever needed. Grab both connection strings: the
   **pooled** one (for the app) and the **direct/unpooled** one (for
   migrations).

3. **Copy `.env.example` to `.env`** and fill in:
   - `DATABASE_URL` - pooled connection string
   - `DIRECT_URL` - direct/unpooled connection string
   - `AUTH_SECRET` - generate with `openssl rand -base64 32`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - optional, only if you want
     "Sign in with Google" in addition to email+password

4. **Apply the database schema**

   ```bash
   npx prisma migrate deploy
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000, sign up, and start creating goals.

### Running tests

```bash
npm run test    # vitest - XP/level math and timezone-boundary math
npm run lint    # eslint
npm run build   # full production build + type-check
```

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from there).
2. Import the repo into Vercel ([vercel.com/new](https://vercel.com/new)).
3. In the Vercel project's Environment Variables, set `DATABASE_URL`,
   `DIRECT_URL`, `AUTH_SECRET` (and the Google ones if used) - same values as
   your local `.env`, scoped to Production (and Preview, if you want preview
   deployments to work against a database too - a separate Neon branch per
   preview is recommended).
4. Set the Vercel project's **Build Command** to:

   ```
   prisma generate && prisma migrate deploy && next build
   ```

   so the deployed schema always matches what's in `prisma/migrations/`.
5. Deploy. The Vercel Hobby (free) plan is sufficient for personal use.

## Project structure

- `app/(auth)/` - login/signup pages
- `app/(app)/` - everything behind auth: dashboard, goals, shop, history
- `lib/domain/` - all business logic (XP/level math, goals, tasks, the daily
  rollover, shop, undo) - framework-independent and unit-tested where it's
  highest-risk
- `lib/validation/` - zod schemas for every form/Server Action input
- `prisma/schema.prisma` - the full data model
