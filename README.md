# AI Help Center

AI blog platform built with Next.js App Router.

## Why Next.js (instead of Astro)

For this project, Next.js is the better fit because it combines:
- strong SEO via server-rendered pages + metadata + sitemap/robots
- authentication and role-based routing
- dynamic app features (comments, member reviews, admin workflows) in one framework

Astro is excellent for mostly static content, but this product needs a full app surface with authenticated user interactions and moderation/admin tooling.

## Features

- Clean, modern blog UI
- dedicated home landing page and separate blog index
- blog search and filters (query, rating, sort, images)
- SEO-ready setup:
  - global metadata
  - per-post metadata
  - XML sitemap (`/sitemap.xml`)
  - robots (`/robots.txt`)
- Auth + accounts:
  - sign up
  - log in/out with credentials
  - `USER` and `ADMIN` roles
- Community:
  - comments on posts
  - free-member reviews
  - moderation flow for comments and reviews
- Admin panel:
  - dashboard metrics
  - create/publish/unpublish posts
  - article cover + gallery image uploads or URLs
  - approve/reject comments and reviews
  - editable global banner/logo via upload or URL
  - logo-driven favicon
  - editable Buy me a coffee URL
- Prisma + SQLite persistence

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env
```

3. Initialize database and generate Prisma client

```bash
npm run prisma:generate
npm run db:push
```

4. Seed demo data

```bash
npm run db:seed
```

5. Run dev server

```bash
npm run dev
```

## Admin login

- Email: `admin@aihelpcenter.dev`
- Password: `admin123`

Update this account in production.

## Core routes

- `/` home landing page
- `/blog` searchable/filterable article index
- `/posts/[slug]` article detail with comments/reviews
- `/subscribe` manage subscription state
- `/login` and `/signup` auth
- `/admin` admin dashboard
- `/admin/posts` content management
- `/admin/moderation` moderation queue
- `/admin/settings` banner and support links
