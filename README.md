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

### Deploy CMS Admin/API
1. Import repository in Vercel.
2. Set **Root Directory** to `apps/cms-admin`.
3. Add env vars:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Build command: `npm run build`
5. Output: default Next.js output.

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
