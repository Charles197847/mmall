# MMall

Multi-vendor B2B2C e-commerce platform. Vendors run branded stores, customers shop with a unified cart, and platform admins manage the ecosystem. One Expo codebase covers Web, iOS, and Android.

## Architecture

| Layer | Technology |
| --- | --- |
| Customer app | Expo (SDK 52+) + Expo Router + NativeWind + Tamagui |
| Vendor dashboard | Next.js (App Router) |
| Admin panel | Next.js (App Router) |
| API | Node.js 20+ · Express · TypeScript |
| Database | PostgreSQL 16+ with Row-Level Security |
| ORM | Prisma |
| Cache / queue | Redis 7+ · BullMQ |
| Search | Elasticsearch 8+ |
| Payments | Stripe Connect |
| Monorepo | Turborepo + pnpm workspaces |

```
shopping-mall/
├── apps/
│   ├── customer-app/       Expo shopper app (web + mobile)
│   ├── vendor-dashboard/   Next.js vendor console
│   └── admin-panel/        Next.js platform admin
├── packages/
│   ├── shared-ui/          Cross-app UI
│   ├── shared-types/       TypeScript contracts
│   ├── api-client/         Typed HTTP client
│   └── config/             ESLint, Tailwind, TypeScript, Tamagui
├── backend/                Express API, Prisma, Docker
└── infrastructure/         Terraform + Kubernetes stubs
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker Desktop (Postgres, Redis, Elasticsearch)

## Quick start

```bash
# Install workspace dependencies
pnpm install

# Start local data services
cd backend
docker compose up -d postgres redis elasticsearch
cd ..

# Copy environment
cp .env.example backend/.env
cp .env.example .env

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start all apps (API :4000, customer :8081, vendor :3001, admin :3002)
pnpm dev
```

Run a single workspace:

```bash
pnpm dev --filter=backend
pnpm dev --filter=customer-app
pnpm dev --filter=vendor-dashboard
pnpm dev --filter=admin-panel
```

## Seeded local accounts

Password for all: `Password123!`

| Role | Email |
| --- | --- |
| Customer | `customer@shopping-mall.local` |
| Vendor | `vendor@shopping-mall.local` |
| Admin | `admin@shopping-mall.local` |

On this machine, Postgres is mapped to **5433** and the API listens on **4000** so they do not collide with other local services.

## API surface (v1)

| Area | Base path |
| --- | --- |
| Auth | `/api/v1/auth` |
| Vendors | `/api/v1/vendors` |
| Products | `/api/v1/products` |
| Orders | `/api/v1/orders` |
| Payments | `/api/v1/payments` |
| Admin | `/api/v1/admin` |
| Search | `/api/v1/search` |
| Health | `http://localhost:4000/health` |

Multi-tenant isolation uses PostgreSQL RLS plus request-scoped `app.tenant_id` / `app.user_id` settings. Stripe Connect handles vendor onboarding and split payouts.

## Phase map

1. **Foundation** — monorepo, Docker, Prisma, shared packages, app shells
2. **Core backend** — RLS, auth, vendor/product/order APIs
3. **Payments** — Stripe Connect + webhooks
4. **Customer app** — browse, cart, checkout
5. **Vendor dashboard** — products, orders, store settings
6. **Admin panel** — approvals and platform analytics

## License

Private — all rights reserved.
