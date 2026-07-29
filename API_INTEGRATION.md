# API Integration Map

How the RentNest frontend consumes the backend API.

- **Backend base URL:** `https://rent-nest-nurunnabi-jewels-projects.vercel.app`
  (configurable via `NEXT_PUBLIC_API_URL`)
- **API docs (Swagger):** `{BASE_URL}/api/docs`
- **Auth scheme:** JWT bearer token — `Authorization: Bearer <token>`.
  The backend uses wildcard CORS **without** credentials, so no cookies are sent
  cross-origin; the token is attached from JS on every request.

## Response contract

Every endpoint returns the same envelope, handled centrally in
[api-client.ts](src/lib/api-client.ts) and [server-api.ts](src/lib/server-api.ts):

```jsonc
// success
{ "success": true, "message": "...", "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }, "data": ... }

// error
{ "success": false, "message": "Validation error",
  "errorDetails": [{ "field": "body.email", "message": "A valid email address is required" }] }
```

`meta` appears only on paginated endpoints. `errorDetails` is an **array** for Zod
validation failures and a **string** for auth/permission errors.

Non-2xx or `success: false` responses are thrown as `ApiError(status, message, errorDetails)`.
Two helpers turn that into UI feedback:

| Helper | Location | Purpose |
| --- | --- | --- |
| `getErrorMessage(error)` | [api-client.ts](src/lib/api-client.ts) | Human-readable string for toasts and error states |
| `applyFieldErrors(error, setError, fields)` | [api-client.ts](src/lib/api-client.ts) | Maps `body.<field>` validation errors onto React Hook Form inputs; unmatched ones become toasts |

## Where fetching happens

- **Server Components** (`serverFetch`) render public, SEO-relevant pages: home,
  browse and property details.
- **Client hooks** (TanStack Query, `apiFetch`) own everything authenticated and
  interactive: all dashboards, mutations and optimistic updates.

## Endpoint map

### Auth

| Frontend | Method + endpoint | Consumer |
| --- | --- | --- |
| [/auth/register](src/app/auth/register/page.tsx) | `POST /api/auth/register` | [register-form.tsx](src/components/forms/register-form.tsx) — chains into login, since register returns no token |
| [/auth/login](src/app/auth/login/page.tsx) | `POST /api/auth/login` | [login-form.tsx](src/components/forms/login-form.tsx) → `login()` in [auth-provider.tsx](src/providers/auth-provider.tsx) |
| Navbar / all protected pages | `GET /api/auth/me` | [auth-provider.tsx](src/providers/auth-provider.tsx) — hydrates the full profile; 401/403 clears the token |

### Public browsing

| Frontend | Method + endpoint | Consumer |
| --- | --- | --- |
| [/](src/app/page.tsx) | `GET /api/properties?limit=6&sortBy=createdAt&sortOrder=desc&availability=AVAILABLE` | Featured grid (Server Component) |
| [/](src/app/page.tsx) | `GET /api/categories` | Category cards |
| [/properties](src/app/properties/page.tsx) | `GET /api/properties` + filter params | Server Component; filters written to the URL by [property-filters.tsx](src/components/properties/property-filters.tsx) |
| [/properties](src/app/properties/page.tsx) | `GET /api/categories` | Category dropdown in the filter sidebar |
| [/properties/[id]](src/app/properties/[id]/page.tsx) | `GET /api/properties/:id` | Details, gallery, landlord card, embedded reviews |

Supported query params on `GET /api/properties`: `searchTerm`, `location`,
`categoryId`, `minPrice`, `maxPrice`, `bedrooms` (exact match), `amenities`
(comma-separated, listing must have **all**), `availability`, `sortBy`
(`rentAmount` \| `createdAt` \| `title`), `sortOrder`, `page`, `limit` (max 50).

### Tenant

| Frontend | Method + endpoint | Consumer |
| --- | --- | --- |
| Property details → "Request to rent" | `POST /api/rentals` | [rental-request-form.tsx](src/components/forms/rental-request-form.tsx); 409 on a duplicate pending/approved request surfaces as a toast |
| [/dashboard/tenant](src/app/dashboard/tenant/page.tsx) → Requests | `GET /api/rentals` | [use-rentals.ts](src/hooks/use-rentals.ts) → [tenant-requests-tab.tsx](src/components/dashboard/tenant-requests-tab.tsx) |
| [/dashboard/tenant/requests/[id]/pay](src/app/dashboard/tenant/requests/[id]/pay/page.tsx) | `GET /api/rentals/:id` | Payment summary + status guard (must be `APPROVED`) |
| Same page → "Pay with Stripe" | `POST /api/payments/create` | [use-payments.ts](src/hooks/use-payments.ts); redirects to the returned `checkoutUrl` |
| [/payment/success](src/app/payment/success/page.tsx) | `GET /api/payments/success?session_id=` | [payment-success-content.tsx](src/components/payment/payment-success-content.tsx); confirms and fulfils the payment |
| [/dashboard/tenant](src/app/dashboard/tenant/page.tsx) → Payments | `GET /api/payments` | [tenant-payments-tab.tsx](src/components/dashboard/tenant-payments-tab.tsx) |
| Requests tab → "Leave review" | `POST /api/reviews` | [review-form.tsx](src/components/forms/review-form.tsx) (only for `COMPLETED` rentals) |
| [/dashboard/tenant](src/app/dashboard/tenant/page.tsx) → Reviews | `GET /api/reviews` | [tenant-reviews-tab.tsx](src/components/dashboard/tenant-reviews-tab.tsx); also used to hide the review button on already-reviewed properties |

### Landlord

| Frontend | Method + endpoint | Consumer |
| --- | --- | --- |
| [/dashboard/landlord](src/app/dashboard/landlord/page.tsx) | `GET /api/landlord/properties` | Stat cards + [use-landlord.ts](src/hooks/use-landlord.ts) |
| [/dashboard/landlord/properties](src/app/dashboard/landlord/properties/page.tsx) | `GET /api/landlord/properties` | Listing table with request/review counts |
| [/dashboard/landlord/properties/new](src/app/dashboard/landlord/properties/new/page.tsx) | `POST /api/landlord/properties` | [property-form.tsx](src/components/forms/property-form.tsx) |
| [/dashboard/landlord/properties/[id]/edit](src/app/dashboard/landlord/properties/[id]/edit/page.tsx) | `GET /api/properties/:id` then `PUT /api/landlord/properties/:id` | Same shared form, prefilled, with an availability selector |
| Properties table → delete | `DELETE /api/landlord/properties/:id` | Soft delete behind a confirmation dialog |
| [/dashboard/landlord/requests](src/app/dashboard/landlord/requests/page.tsx) | `GET /api/landlord/requests?status=` | Status tabs → [landlord-request-row.tsx](src/components/dashboard/landlord-request-row.tsx) |
| Approve / Reject / Complete | `PATCH /api/landlord/requests/:id` | **Optimistic update** in `useUpdateRequestStatus` ([use-landlord.ts](src/hooks/use-landlord.ts)) — patches every status-filtered cache, rolls all of them back on failure |

### Admin

| Frontend | Method + endpoint | Consumer |
| --- | --- | --- |
| [/dashboard/admin](src/app/dashboard/admin/page.tsx) | `GET /api/admin/users`, `GET /api/admin/properties`, `GET /api/admin/rentals` (all `limit=1`) | Stat cards read `meta.total` only |
| [/dashboard/admin/users](src/app/dashboard/admin/users/page.tsx) | `GET /api/admin/users?page&limit&role&status` | Paginated table; search filters the current page client-side (the backend has no user-search param) |
| Same page → Ban / Unban | `PATCH /api/admin/users/:id` | [use-admin.ts](src/hooks/use-admin.ts); admin accounts are protected and cannot be banned |
| [/dashboard/admin/properties](src/app/dashboard/admin/properties/page.tsx) | `GET /api/admin/properties?page&limit` | Includes soft-deleted listings, flagged with a "Removed" badge |
| [/dashboard/admin/rentals](src/app/dashboard/admin/rentals/page.tsx) | `GET /api/admin/rentals?page&limit&status` | Platform-wide rental moderation |

## Query keys and cache invalidation

Keys are centralised in [query-keys.ts](src/lib/query-keys.ts).

| Mutation | Invalidates |
| --- | --- |
| Create rental request | `['tenant','rentals']`, `['property', id]` |
| Confirm payment | `['tenant','rentals']`, `['tenant','payments']` |
| Create review | `['tenant','reviews']`, `['property', id]` |
| Create / update / delete property | `['landlord','properties']`, `['properties']`, `['property', id]` |
| Update request status | `['landlord','requests']` (all filters), `['landlord','properties']` — completing a rental frees the property |
| Ban / unban user | `['admin','users']` |

## Rental status flow

```
PENDING ──approve──> APPROVED ──Stripe payment──> ACTIVE ──complete──> COMPLETED
   │                                                                       │
   └──reject──> REJECTED                                          tenant can review
```

Badge colours: `PENDING` amber · `APPROVED` blue (shows "Pay now") · `REJECTED` red ·
`ACTIVE` green · `COMPLETED` grey (shows "Leave review"). Implemented in
[status-badge.tsx](src/components/dashboard/status-badge.tsx).

## Backend change made for this frontend

Stripe originally redirected back to the API itself, which left users on a raw JSON
page. In the backend repo (`B7A4/RentNest`):

- `src/config/index.ts` — added `frontend_url` (env `FRONTEND_URL`, default `http://localhost:3000`)
- `src/modules/payment/payment.service.ts` — checkout session now uses
  `success_url: {FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&rentalId=...`
  and `cancel_url: {FRONTEND_URL}/payment/cancel?rentalId=...`

The existing `GET /api/payments/success` endpoint is unchanged and is now called
*by the frontend* to fulfil the payment. It is idempotent, and the Stripe webhook
remains in place as a fallback.

## Endpoints intentionally not consumed

`POST/PATCH/DELETE /api/categories` (admin category CRUD), `GET /api/payments/:id`,
and `GET /api/rentals/:id` for landlords — the list endpoints already carry
everything the current screens display.
