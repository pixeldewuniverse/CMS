# Vercel-Optimized Headless CMS Monorepo

This repository is a production-ready monorepo for a multi-site headless CMS designed for **Vercel deployment**.

## 1) Full Project Folder Structure

```txt
root/
├ apps/
│  ├ cms-admin/
│  │  ├ app/
│  │  │  ├ api/
│  │  │  │  ├ auth/login/
│  │  │  │  ├ auth/register/
│  │  │  │  ├ sites/
│  │  │  │  ├ pages/
│  │  │  │  ├ page/[slug]/
│  │  │  │  ├ posts/
│  │  │  │  └ post/[slug]/
│  │  │  ├ dashboard/
│  │  │  ├ sites/
│  │  │  ├ pages/
│  │  │  ├ posts/
│  │  │  ├ media/
│  │  │  ├ menus/
│  │  │  ├ users/
│  │  │  ├ settings/
│  │  │  └ login/
│  │  ├ components/
│  │  ├ lib/
│  │  ├ styles/
│  │  ├ package.json
│  │  └ next.config.js
│  └ client-site/
│     ├ app/
│     ├ components/
│     ├ lib/
│     ├ styles/
│     ├ package.json
│     └ next.config.js
├ packages/
│  ├ database/
│  │  ├ prisma/
│  │  │  └ schema.prisma
│  │  └ src/
│  └ api/
│     ├ routes/
│     ├ controllers/
│     └ services/
├ package.json
└ README.md
```

## 2) Prisma Schema

Prisma schema is at `packages/database/prisma/schema.prisma` and includes:

- `User`
- `Site`
- `Page` (belongs to `Site`)
- `Post` (belongs to `Site`)
- `Category`
- `Media`
- `Menu`
- `MenuItem`

## 3) API Route Examples (Vercel Serverless)

Implemented as Next.js App Router route handlers in `apps/cms-admin/app/api`:

- `GET /api/sites`
- `POST /api/sites`
- `GET /api/pages?site=domain.com`
- `GET /api/page/[slug]?site=domain.com`
- `GET /api/posts?site=domain.com`
- `GET /api/post/[slug]?site=domain.com`
- `POST /api/auth/register`
- `POST /api/auth/login`

These are serverless-compatible and avoid long-running Express servers.

## 4) CMS Dashboard Layout

CMS admin sidebar includes:

- Dashboard
- Sites
- Pages
- Posts
- Media
- Menus
- Users
- Settings

Pages editor supports:

- title
- slug
- rich text content
- publish / draft

## Admin Authentication

- Login UI is available at `/login` with email/password fields, submit button, and inline error state.
- `POST /api/auth/login` validates credentials against Prisma user records, compares bcrypt hash, signs a JWT, and stores it in an HTTP-only cookie.
- Middleware protects `/dashboard`, `/pages`, `/posts`, `/media`, and `/settings`; unauthenticated users are redirected to `/login`.
- `POST /api/auth/logout` clears the auth cookie and redirects users back to `/login`.
- Login page is rendered without the dashboard shell/sidebar to keep auth separate from CMS content views.

### Prisma User model (hashed password)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("ADMIN")
  createdAt DateTime @default(now())
}
```

### Example admin user creation

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD='admin123' \
npm run create:admin:ts --workspace @packages/database
```

Protected admin routes via middleware:

- `/dashboard`
- `/pages`
- `/posts`
- `/media`
- `/settings`

## 5) Client Site Example

Client app routes:

- `/`
- `/about`
- `/blog`
- `/blog/[slug]`
- `/contact`

Example fetch usage:

```ts
fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/pages?site=mydomain.com`)
```

## 6) Deployment Instructions (Vercel)

### Build behavior (important)
- Root `npm run build` is intentionally scoped to **only** build `apps/cms-admin` (the deploy target) so Vercel does not attempt to build non-app workspaces.
- Root `postinstall` runs Prisma generation in the database workspace so Vercel has a generated Prisma Client immediately after `npm install`.
- `packages/database` has a `build` script that runs `prisma generate`.
- Root build command explicitly runs Prisma generate first, then `cms-admin` build.
- `packages/api` includes a no-op build script to prevent Vercel workspace failures (`api build skipped`).

### SWC + lockfile warning fix

If Vercel warns about missing SWC dependencies in lockfile, regenerate lockfile from the repo root:

```bash
npm install
npm run build
```

This refreshes framework-native `next` optional binaries (SWC packages) in lockfile and aligns workspace dependency graph for Vercel builds.

### Tailwind glob warning fix

Tailwind content configuration now uses:

- `./app/**/*.{js,ts,jsx,tsx}`
- `./components/**/*.{js,ts,jsx,tsx}`
- `./styles/**/*.css`

This removes invalid glob warnings and ensures classes in `styles/globals.css` are scanned.

### Deploy CMS Admin/API
1. Import repository in Vercel.
2. Set **Root Directory** to `apps/cms-admin` (this is required so Vercel outputs `.next` in `apps/cms-admin/.next` instead of expecting `/root/.next`).
3. Add env vars:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET`
4. Build command: `npm run build`
5. Output: default Next.js output.

### Optional `vercel.json`

At repo root:

```json
{
  "framework": "nextjs"
}
```

This works with the **Root Directory** still set to `apps/cms-admin` in the Vercel project settings.

### Deploy Client Site
1. Create another Vercel project from same repo.
2. Set **Root Directory** to `apps/client-site`.
3. Add env vars:
   - `NEXT_PUBLIC_CMS_URL` (your cms-admin Vercel URL)
   - `NEXT_PUBLIC_SITE_DOMAIN`
4. Build command: `npm run build`

### Database
- Run `npm run prisma:generate` and migrations in CI or locally before production rollout.
- Use a managed PostgreSQL provider (Neon, Supabase, RDS, etc.).

### Example Prisma query (server-side)

```ts
import { prisma } from '@/lib/prisma';

export async function getPublishedPages(siteId: string) {
  return prisma.page.findMany({
    where: { siteId, status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' }
  });
}
```
