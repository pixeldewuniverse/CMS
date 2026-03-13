# Multi-Site Headless CMS Platform

Production-ready monorepo scaffold with:

- `cms-admin`: Next.js App Router admin panel with Tailwind.
- `cms-api`: Express + Prisma + PostgreSQL backend with JWT auth.
- `client-template`: Next.js client site template consuming CMS API.
- `shared/types`: reusable TypeScript types.

## Folder Structure

```txt
root/
├ cms-admin/
│  ├ app/
│  ├ components/
│  ├ pages/
│  ├ dashboard/
│  ├ login/
│  └ settings/
├ cms-api/
│  ├ controllers/
│  ├ routes/
│  ├ middleware/
│  ├ services/
│  ├ prisma/
│  └ server.js
├ client-template/
│  ├ app/
│  ├ components/
│  ├ lib/
│  └ styles/
└ shared/
   └ types/
```

## CMS Connection Flow

Client website → Fetch CMS API → Receive JSON content → Render dynamically.

## REST API

- `GET /sites`
- `POST /sites`
- `GET /pages?site=domain`
- `GET /page/:slug?site=domain`
- `GET /posts?site=domain`
- `GET /post/:slug?site=domain`
- `GET /menu?site=domain&location=main`

## Bonus Features Included

- SEO fields (`seoTitle`, `seoDescription`) for pages/posts/sites.
- Media upload endpoint using `multer`.
- Site configuration fields (logo/color/description).
- Reusable content sections (`ContentSection` model).
