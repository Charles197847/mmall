# Deploy MMall

This is the go-live map for the Meeronix Vercel team (Hobby). It does not create projects, buy domains, or change DNS. The apex `meeronixgroup.co.za` already serves the group website and stays untouched. Nameservers stay at the registrar (`ns1.tld-ns.net` and the rest). Only the subdomain CNAMEs below are added there.

Postgres stays Prisma. Supabase is the hosted Postgres only: no Supabase Auth, no Data API, no RLS rewrite. Payments stay the existing PayGate mock. The catalog / mock-SKU policy is unchanged.

## What is deployable

| Surface | Host | Suggested name | Root directory | Build |
| --- | --- | --- | --- | --- |
| Shopper storefront (`/shop`) and vendor desk | Vercel | `mmall-shop` | `apps/vendor-dashboard` | `pnpm exec turbo build --filter=vendor-dashboard` |
| Platform admin | Vercel | `mmall-admin` | `apps/admin-panel` | `pnpm exec turbo build --filter=admin-panel` |
| Expo web export (optional) | Vercel static | `mmall-app` | `apps/customer-app` | `pnpm exec turbo build --filter=customer-app` (`expo export --platform web`). The npm script is `build`, not `prebuild`, so a web deploy does not generate the native projects. Native generation stays `pnpm --filter customer-app native:prebuild` or EAS. |
| Express API + BullMQ worker | Render or Railway, one always-on service | `mmall-api` | repository root | `pnpm install --frozen-lockfile && pnpm --filter backend build` |
| Native shopper app | Expo Go / EAS | — | `apps/customer-app` | not a website |

Each Vercel app already has a `vercel.json` with the install and build commands. In the project, set **Root Directory** to the path in the table and leave **Include source files outside of the Root Directory** enabled so `packages/*` and the pnpm lockfile are part of the build. Framework preset is Next.js for the two web apps. For `mmall-app`, framework is Other and the output directory is `dist`. Node.js version: **22.x** (Node 20 is deprecated on Vercel). The repo pins `pnpm@10.15.1` via `packageManager`.

`pnpm --filter backend build` runs `prisma generate` and then `tsc`. Generate does not connect to the database. If `DATABASE_URL` / `DIRECT_URL` are missing at generate time, the build script fills a local dummy URL so the client can still be generated. Migrate and the running API use the real URLs.

## Why the API is not a Vercel Function

The API process is not a stateless request handler:

- BullMQ workers are started in the same process as HTTP (`startWorkers()` in `backend/src/index.ts`). Payment, notification, fulfilment, and search-index jobs need a process that stays up between requests.
- Redis is required for those queues.
- The live grid is an in-process SSE fan-out. Passkey challenges, magic-link codes, and the PayGate return URL for an in-flight mock checkout are also held in memory.
- Platform commission settings are written to `backend/data/platform-settings.json` on local disk.

A second instance would split that memory, and a scale-to-zero function would drop the workers. Run **one** web service. Do not add a separate worker service unless the in-process `startWorkers()` call is removed first.

Render's free web service, where it is still offered, sleeps after about 15 minutes without traffic. The next request waits for a cold start, and BullMQ does not run while the process is asleep. Railway trial usage stops when the credits run out. For a demo that should stay open in a browser, use an always-on instance. Point the host's health check at `GET /health`.

## Domains

| Hostname | Points at | App |
| --- | --- | --- |
| `mmall.meeronixgroup.co.za` | Vercel project `mmall-shop` | `/shop` storefront and the vendor desk at `/` for a signed-in vendor |
| `mmall-admin.meeronixgroup.co.za` | Vercel project `mmall-admin` | Admin panel |
| `mmall-api.meeronixgroup.co.za` | Render or Railway | Express API |
| `mmall-app.meeronixgroup.co.za` | Vercel project `mmall-app` (optional) | Expo web export |

A guest who opens `https://mmall.meeronixgroup.co.za/` is sent to `/shop`. A signed-in vendor or admin stays on the vendor desk.

Do not attach `meeronixgroup.co.za` or `www.meeronixgroup.co.za` to these projects.

### DNS records at the registrar

Add CNAMEs only. Use the target Vercel shows on that project's Domains page when it differs from `cname.vercel-dns.com` (Vercel sometimes shows a project-specific `*.vercel-dns-0NN.com` name). Use the hostname Render or Railway shows for the API (for example `mmall-api.onrender.com`).

| Host / name | Type | Value |
| --- | --- | --- |
| `mmall` | CNAME | `cname.vercel-dns.com` or the `mmall-shop` target Vercel shows |
| `mmall-admin` | CNAME | `cname.vercel-dns.com` or the `mmall-admin` target Vercel shows |
| `mmall-app` | CNAME | `cname.vercel-dns.com` or the `mmall-app` target Vercel shows. Skip this row if Expo web is not deployed. |
| `mmall-api` | CNAME | the Render or Railway hostname |

On a .co.za registrar such as domains.co.za the name is usually the label (`mmall`), not the full hostname. Leave the apex and `www` records exactly as they are. Do not change nameservers.

## Postgres on Supabase

Create an empty Supabase project and use it as Postgres. In **Project Settings → Data API**, remove `public` from the exposed schemas so the anon key cannot read tables. Do not enable Supabase Auth. The API connects with Prisma as the database user and does not use the Supabase client.

The existing RLS policies stay as they are. The `postgres` role that owns the tables bypasses RLS, which is how Prisma works today. That is safe only while the Data API is not exposing `public`.

Render and Railway are IPv4. Supabase's direct host (`db.<ref>.supabase.co`) is IPv6 unless the IPv4 add-on is on. Use the **session pooler** (port **5432** on `*.pooler.supabase.com`) for this long-running Node process. Session mode supports Prisma's prepared statements. Do not put the transaction pooler (port **6543**) in `DATABASE_URL`.

Copy both strings from the Supabase **Connect** dialog. `sslmode=require` is required.

```text
# Runtime. Session pooler, IPv4. One small Node process.
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=5

# Prisma Migrate. Same session pooler when the host is IPv4-only.
# If the IPv4 add-on is on, this can be the direct db.PROJECT_REF.supabase.co:5432 URL instead.
DIRECT_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

Put the Supabase project in the same region as the API service.

`schema.prisma` reads `DATABASE_URL` for queries and `DIRECT_URL` for migrations. Apply migrations once, from the API host's release command or from a machine that can reach `DIRECT_URL`:

```bash
pnpm --filter backend db:migrate:deploy
```

### Demo seed

`backend/prisma/seed.ts` inserts the README accounts. Every one of them uses the password `Password123!`.

The seed refuses to run when `NODE_ENV=production` or when `DATABASE_URL` / `DIRECT_URL` is a hosted database (Supabase, Neon, RDS, Render, Railway), unless `ALLOW_DEMO_SEED=true`.

For a public demo database, run it once and then remove the flag:

```bash
ALLOW_DEMO_SEED=true pnpm --filter backend db:seed
```

Unset `ALLOW_DEMO_SEED` afterwards so a later deploy cannot reset those passwords by accident. Do not set the flag on a database that holds real customers. Anyone who can read this repository knows the demo password.

Local docker (`localhost`, `127.0.0.1`, or the compose hostname `postgres`) still seeds with no flag.

## Redis on Upstash

Create an Upstash Redis database with eviction **off** (`noeviction`). BullMQ cannot use a database that evicts keys. Copy the **Redis** URL (`rediss://...`, TLS). `ioredis` is already configured with `maxRetriesPerRequest: null`, which BullMQ requires, and it skips the ready check on `rediss://` URLs.

```text
REDIS_URL=rediss://default:TOKEN@HOST.upstash.io:6379
```

Put Upstash in the same region as the API. The API still boots if Redis is down, but queue adds used by checkout will fail until Redis is reachable, so treat `REDIS_URL` as required for the demo.

## Search without Elasticsearch

Product search can run on Postgres. Set:

```text
SEARCH_PROVIDER=postgres
```

`GET /api/v1/search` then uses a case-insensitive match on name, description, and category, and the index jobs become no-ops. Leave `ELASTICSEARCH_URL` empty. `GET /health` reports `"search": "postgres"`.

The default remains `elasticsearch` so local docker is unchanged. If Elasticsearch is down and the provider is still `elasticsearch`, the request falls back to the same Postgres query after the client errors. That fallback can sit on a connection timeout, so the demo should set the flag rather than rely on the error path.

Relevance ranking, tag search, and a hosted cluster are not required for the demo. If a later launch needs that ranking, the usual low-cost hosts are Elastic Cloud's smallest deployment or a Bonsai sandbox. Check their current prices before buying either. Do not provision one for this demo.

## PayGate

`PAYGATE_MODE` must stay `mock` (or `sandbox`). Production refuses to start on any other value. Live PayGate is not wired. The test id `10011072130` and encryption key `secret` are PayGate's published sandbox values.

```text
PAYGATE_ID=10011072130
PAYGATE_ENCRYPTION_KEY=secret
PAYGATE_MODE=mock
API_PUBLIC_URL=https://mmall-api.meeronixgroup.co.za
```

There is no single PayGate return URL. Each checkout client sends `paymentReturnUrl`, and the API keeps it only when the origin and path are on the allowlist.

| Checkout | Client sends | Allowlisted return |
| --- | --- | --- |
| `/shop` on `mmall.meeronixgroup.co.za` | `window.location.origin` + `/shop/checkout/payment-return` | `https://mmall.meeronixgroup.co.za/shop/checkout/payment-return` |
| Expo web on `mmall-app.meeronixgroup.co.za` | `window.location.origin` + `/cart/payment-return` | `https://mmall-app.meeronixgroup.co.za/cart/payment-return` |
| Expo Go / EAS | `mmall://` or `exp://` link to `/cart/payment-return` | that native link, when the path is the cart return |

The shop page is `apps/vendor-dashboard/app/shop/checkout/payment-return`. The Expo page is `apps/customer-app/app/(customer)/cart/payment-return.tsx`. A shop return is not rewritten to the Expo app, and an Expo web return is not rewritten to the shop. Anything else, including localhost in production, is rejected and checkout does not start.

The allowlist is built from `VENDOR_DASHBOARD_URL` (shop path only) and `FRONTEND_URL` (Expo web path only), plus those two production URLs. `PAYGATE_RETURN_URLS` is an optional comma-separated list of extra full return URLs for preview deploys. Do not set one global `PAYGATE_RETURN_URL` and expect every client to land there. If that older variable is set, it is only one more allowlist entry.

The notify URL is still one API URL, not a per-client setting. It is `{API_PUBLIC_URL}/api/v1/payments/paygate/notify`:

```text
https://mmall-api.meeronixgroup.co.za/api/v1/payments/paygate/notify
```

Set `NEXT_PUBLIC_DEMO_PAYMENTS=true` on `mmall-shop` and `EXPO_PUBLIC_DEMO_PAYMENTS=true` on `mmall-app`. That shows a one-line notice, **Demo — payments are simulated**, on every `/shop` page (including checkout) and across the Expo web export. The native app does not show it.

## Environment variables

Values below are the production demo. Nothing here is a real secret. Set secrets in the host's dashboard, not in git. `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` are baked into the browser bundle.

Client API variables include the `/api/v1` prefix because the apps append paths such as `/auth/login`. The API host itself is `https://mmall-api.meeronixgroup.co.za`. A production build that forgets the variable still falls back to `https://mmall-api.meeronixgroup.co.za/api/v1`. Set it anyway so the value is visible in the dashboard.

### `mmall-shop` (Vercel, `apps/vendor-dashboard`)

| Name | Public | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `https://mmall-api.meeronixgroup.co.za/api/v1` |
| `NEXT_PUBLIC_DEMO_PAYMENTS` | yes | `true` |
| `NEXT_PUBLIC_IMGBB_API_KEY` | yes | optional. Product image uploads go from the browser to imgbb. Empty means vendors paste an image URL. |

### `mmall-admin` (Vercel, `apps/admin-panel`)

| Name | Public | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `https://mmall-api.meeronixgroup.co.za/api/v1` |

### `mmall-app` (Vercel, `apps/customer-app`, optional)

| Name | Public | Value |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | yes | `https://mmall-api.meeronixgroup.co.za/api/v1` |
| `EXPO_PUBLIC_DEMO_PAYMENTS` | yes | `true` |

Use the same `EXPO_PUBLIC_API_URL` for EAS preview and production builds. A native binary cannot call localhost. Those profiles already set it in `apps/customer-app/eas.json`. Google Play account setup, `eas init`, the preview APK, the production AAB, and closed testing are in [MOBILE_RELEASE.md](MOBILE_RELEASE.md).

### `mmall-api` (Render or Railway)

| Name | Secret | Value |
| --- | --- | --- |
| `NODE_ENV` | no | `production` |
| `PORT` | no | injected by Render/Railway. The process listens on `0.0.0.0` and this port. |
| `DATABASE_URL` | yes | Supabase session pooler, port 5432, `sslmode=require`, `connection_limit=5` |
| `DIRECT_URL` | yes | Supabase session pooler (or direct 5432 if IPv4/IPv6 reachability is confirmed). Used by `prisma migrate deploy`. |
| `REDIS_URL` | yes | Upstash `rediss://` URL, eviction off |
| `SEARCH_PROVIDER` | no | `postgres` |
| `JWT_SECRET` | yes | `openssl rand -base64 48`. At least 32 characters. The placeholders in `.env.example` are rejected (MM-QA-032). |
| `JWT_EXPIRES_IN` | no | `2h` |
| `WEBAUTHN_RP_ID` | no | `meeronixgroup.co.za` so one passkey can be used on the subdomains. `localhost` is ignored in production. |
| `WEBAUTHN_ORIGINS` | no | `https://mmall.meeronixgroup.co.za,https://mmall-admin.meeronixgroup.co.za,https://mmall-app.meeronixgroup.co.za` |
| `API_PUBLIC_URL` | no | `https://mmall-api.meeronixgroup.co.za`. Notify is `{API_PUBLIC_URL}/api/v1/payments/paygate/notify`. |
| `VENDOR_DASHBOARD_URL` | no | `https://mmall.meeronixgroup.co.za`. Shop returns use this origin + `/shop/checkout/payment-return`. |
| `FRONTEND_URL` | no | `https://mmall-app.meeronixgroup.co.za`. Expo web returns use this origin + `/cart/payment-return`. |
| `PAYGATE_RETURN_URLS` | no | empty. Optional extra full return URLs, comma-separated, for preview hosts. Not a single global return. |
| `PAYGATE_ID` | no | `10011072130` |
| `PAYGATE_ENCRYPTION_KEY` | yes | `secret` (published sandbox key) |
| `PAYGATE_MODE` | no | `mock` |
| `ADMIN_PANEL_URL` | no | `https://mmall-admin.meeronixgroup.co.za` |
| `CORS_ORIGINS` | no | empty, or extra `https://` preview origins. The three hosts above are always allowed. Localhost entries are dropped in production. |
| `ALLOW_DEMO_SEED` | no | unset. `true` only for the one-shot demo seed, then remove it. |
| `KYC_PROVIDER` | no | `smileid` |
| `KYC_STUB_AUTO_APPROVE` | no | `true` on the demo so vendors are not stuck. `false` before any real review process. |
| `STORAGE_PROVIDER` | no | `local`. Platform settings live in a JSON file on the service disk and reset when the disk resets. |

Optional and unused by the demo: `OPENAI_API_KEY`, `RECRAFT_API_KEY`, `IDEOGRAM_API_KEY`, `FIREBASE_SERVER_KEY`, `FCM_SERVER_KEY`, `AWS_*`, `CLOUDINARY_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_*`. Leave them unset. Do not put a Supabase service-role key in a `NEXT_PUBLIC_` variable.

Suggested Render/Railway commands, from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter backend db:migrate:deploy
pnpm --filter backend build
pnpm --filter backend start
```

`start` is `node dist/index.js` with the working directory set to `backend`.

## Go-live checklist

1. Supabase project created. Data API does not expose `public`. Auth is not used.
2. `DATABASE_URL` is the session pooler (port 5432, `sslmode=require`). `DIRECT_URL` is set. `pnpm --filter backend db:migrate:deploy` has been run against that database.
3. Demo seed has been run only if this database is the public demo, with `ALLOW_DEMO_SEED=true`, and the flag has been removed. The password `Password123!` is now public on that database.
4. Upstash Redis exists, eviction is off, and `REDIS_URL` is the `rediss://` URL.
5. `SEARCH_PROVIDER=postgres`. No Elasticsearch cluster.
6. `JWT_SECRET` is a new 32+ character value. The API process logs `Refusing to start` and exits if it is missing or still a placeholder.
7. API service is one always-on instance. `GET https://mmall-api.meeronixgroup.co.za/health` returns `status: ok`, `search: postgres`, `payments: mock`.
8. Vercel projects `mmall-shop` and `mmall-admin` (and `mmall-app` if wanted) use the root directories and commands above. `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` are `https://mmall-api.meeronixgroup.co.za/api/v1`. Demo payment flags are `true`.
9. Domains added on each Vercel project and on the API host. Registrar CNAMEs match the targets those dashboards show. Apex and `www` were not edited.
10. A guest opening `https://mmall.meeronixgroup.co.za/` lands on `/shop` and sees **Demo — payments are simulated**. Shop checkout returns to `https://mmall.meeronixgroup.co.za/shop/checkout/payment-return`. Expo web checkout returns to `https://mmall-app.meeronixgroup.co.za/cart/payment-return`. The mock PayGate page is on `https://mmall-api.meeronixgroup.co.za/paygate/mock/...`.
11. Admin at `https://mmall-admin.meeronixgroup.co.za` can call the API (no CORS error). Expo web, if deployed, uses the same API host and its own return URL.

## What still blocks a real store

- Payments are simulated. There is no live PayGate merchant account, and the code refuses a non-mock `PAYGATE_MODE`.
- The demo password is in the repository. Seeded accounts are not a production credential.
- Supabase's Data API must stay off `public`. Later tables (users, KYC, passkeys, shipments, ads, notifications) are not all covered by the original RLS migration, and the Prisma role bypasses RLS.
- Platform settings, SSE subscribers, passkey challenges, and in-flight PayGate return URLs are process-local. One instance, and a restart drops them.
- `KYC_STUB_AUTO_APPROVE=true` approves vendors without a review.
- Postgres search is a contains-match, not the Elasticsearch ranking.
- A sleeping free-tier API host stalls checkout and the queue.
- Vercel Hobby is a non-commercial plan. A store that takes real payment needs a plan that allows that use, plus a live payment provider.
- The mock catalog policy is unchanged. Demo listings are still not charged through PayGate.
