# RentNest — Frontend 🏠

> Find & list rental properties with ease.

A responsive Next.js (App Router) frontend for the RentNest rental marketplace.
Tenants browse and request properties then pay through Stripe; landlords manage
listings and approve requests; admins moderate the whole platform.

## Live links

| | |
| --- | --- |
| **Live frontend** | https://rent-nest-ease.vercel.app |
| **Demo video** | https://drive.google.com/file/d/178qdUh2Lf4cCaAg8DY1_hzYYge_F811P/view?usp=sharing |
| **Backend API** | https://rent-nest-nurunnabi-jewels-projects.vercel.app |
| **API docs (Swagger)** | https://rent-nest-nurunnabi-jewels-projects.vercel.app/api/docs |
| **Frontend repo** | https://github.com/Nurunnabi87/rent-nest-ease |
| **Backend repo** | https://github.com/Nurunnabi87/rent-nest |

## Test credentials

| Role | Email | Password |
| --- | --- | --- |
| **Admin** | `admin@rentnest.com` | `admin123` |
| Tenant | `demo.tenant@example.com` | `pass123` |
| Landlord | `demo.landlord@example.com` | `pass123` |

You can also register your own tenant or landlord account from `/auth/register`.

Admin accounts cannot be created through the UI — the backend rejects `ADMIN`
at registration, so use the seeded credentials above.

**Stripe test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui, dark mode via `next-themes` |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Notifications | Sonner toasts |
| Payments | Stripe Checkout (hosted, redirect flow) |
| Auth | Custom JWT + Next.js Middleware route protection |

## Getting started

```bash
npm install
cp .env.example .env.local   # then adjust if needed
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the RentNest backend, no trailing slash |

```env
NEXT_PUBLIC_API_URL=https://rent-nest-nurunnabi-jewels-projects.vercel.app
```

### Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Features

### Public
- Responsive property grid with `next/image` optimisation
- Advanced filtering: search, location, category, price range, bedrooms,
  amenities (must match all), availability, and sorting — all URL-driven, so
  filtered views are shareable and bookmarkable
- Property details with image gallery, amenities, landlord contact and reviews
- Skeleton loaders (`loading.tsx`) and error boundaries (`error.tsx`) throughout

### Tenant
- Register / log in with inline Zod validation
- Submit a rental request (move-in date, duration, message) from a dialog
- Dashboard tabs: requests with status badges, payment history, own reviews
- Stripe Checkout for the first month's rent, with success and cancel pages
- Leave a review once a rental is completed (one per property)

### Landlord
- Overview of properties, pending requests, active rentals and earnings
- Full property CRUD with dynamic image-URL inputs (live thumbnails) and an
  amenity chip picker
- Approve / reject / complete requests with **optimistic UI updates** and rollback
  on failure

### Admin
- Platform statistics (users, properties, rentals, pending requests)
- User management with role/status filters, pagination and ban/unban actions
- Moderation views for every property (including removed ones) and every rental

### Cross-cutting
- Role-based navigation and dashboards, enforced by
  [middleware.ts](src/middleware.ts) — unauthenticated users are redirected to
  login, and users on another role's dashboard are bounced to their own
- Consistent error handling: toasts for API failures, inline field errors mapped
  from backend Zod responses, error boundaries and a custom 404
- Light / dark / system theme

## Project structure

```
src/
├── middleware.ts             # route protection + role redirects
├── app/
│   ├── page.tsx              # home (Server Component)
│   ├── properties/           # browse + details
│   ├── auth/                 # login, register
│   ├── payment/              # success, cancel
│   └── dashboard/            # tenant, landlord, admin
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── layout/               # navbar, footer, sidebar, theme toggle
│   ├── properties/           # cards, gallery, filters, reviews
│   ├── forms/                # all React Hook Form + Zod forms
│   ├── dashboard/            # stat cards, status badges, tables, tabs
│   ├── payment/              # Stripe result screens
│   └── shared/               # empty state, confirm dialog, page header
├── hooks/                    # TanStack Query hooks per domain
├── lib/                      # api client, server fetch, jwt, cookies, query keys
├── providers/                # query client, theme, auth context
├── schemas/                  # Zod schemas
└── types/                    # API envelope + domain models
```

## Authentication

The JWT is stored in a **non-httpOnly cookie** (`rentnest_token`, 7 days, matching
the backend's token lifetime). This is deliberate: the backend authenticates via
the `Authorization` header with wildcard CORS and no credentials, so client-side
JavaScript must read the token regardless — and keeping it in a cookie is what
allows Next.js Middleware to read it server-side for route protection.

The cookie is exposed through a small subscribable store, so `AuthProvider` tracks
it with `useSyncExternalStore` rather than duplicating auth into component state.
The token's claims (`userId`, `email`, `role`) render the UI immediately, then
`GET /api/auth/me` fills in the complete profile. A 401 or 403 clears the token
automatically, so a banned user is signed out on their next request.

## Payment flow

```
Approved request → "Pay with Stripe" → POST /api/payments/create
   → redirect to Stripe Checkout → pay with test card
   → /payment/success?session_id=…  → GET /api/payments/success
   → payment COMPLETED, rental ACTIVE, property RENTED
```

Cancelling returns to `/payment/cancel`; nothing is charged and the request stays
approved so payment can be retried.

This required one small backend change so Stripe redirects to the frontend rather
than to the API — see
[API_INTEGRATION.md](API_INTEGRATION.md#backend-change-made-for-this-frontend).
The backend needs `FRONTEND_URL` set to the deployed frontend origin.

## Deployment (Vercel)

1. Import this repository in Vercel (framework preset: Next.js).
2. Set `NEXT_PUBLIC_API_URL` to the backend URL.
3. Deploy, then set `FRONTEND_URL` in the **backend's** Vercel project to the
   deployed frontend URL and redeploy the backend so Stripe redirects land here.

## API integration

Every endpoint the frontend consumes, and the component that consumes it, is
documented in **[API_INTEGRATION.md](API_INTEGRATION.md)**.
