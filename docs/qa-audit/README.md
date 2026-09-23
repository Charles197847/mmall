# MMall QA audit

Cross-cutting shopper + vendor + admin audit of the [MMall monorepo](https://github.com/Charles197847/mmall). **This package is specification only** — no product fixes were made.

| | |
| --- | --- |
| **Date** | 15 Sep 2026 |
| **Commit audited** | `a51e9b1` (`main` at branch time) |
| **Method** | Static analysis of source. The full stack (API, Postgres, Expo, Next) was **not** started. Findings marked *runtime-unverified* still need a live pass. |
| **Surfaces** | `apps/customer-app` (Expo web/iOS/Android), `apps/vendor-dashboard` (vendor console + `/shop`), `apps/admin-panel`, `backend`, `packages/api-client`, `packages/shared-types`, `packages/shared-ui` |

## Executive summary

The mall **directory, cart, checkout UI, passwordless auth, and vendor desk are wired end-to-end in navigation**. A guest can browse courts, open a product, add to bag, and reach checkout on both Expo and Next `/shop`. A merchant can register, land on a dashboard, and manage products, orders, KYC, ads, studio, fees, and store settings.

The journeys **break where money and identity leave the client**:

1. **Web checkout has no payment-return screen.** After mock PayGate, `/shop` shoppers are sent to the Expo default (`http://localhost:8081/cart/payment-return`) because checkout never passes `paymentReturnUrl`. That is a **blocker for the web shopper pay loop**.
2. **Gift cards and promotional vouchers are local-only.** Issue, claim, and checkout “discount” live in AsyncStorage / `localStorage`. The order API always charges `subtotal + shipping`. The shopper’s PayGate button can show a reduced total that the server does not honour.
3. **Home and court rails mix live API products with hardcoded `mock-*` listings.** On Expo, those IDs are sent to `POST /orders` and 400. On `/shop`, mock-only bags are blocked with a dead-end message.
4. **Google / Apple buttons are advertised on every auth screen; the API returns 501.** Password, email OTP, magic link, and passkeys are the working paths.
5. **Expo branding assets referenced by `require()` and `app.json` are missing from the repo** (`mmall-bag.png`, icons, splash, banner). That is a **likely Metro / EAS build blocker**. Next `/shop` also references `/mmall-bag.png` and `/mmall-wordmark.png` that are not in `public/`.

Vendor sell → dashboard is the healthiest critical journey (API-backed CRUD, KYC banners, courier book/advance). Treat PayGate, Courier Guy tracking, studio top-up, and ad “purchase” as **demo stubs**, which the README already labels as mock for local use.

Admin can log in, approve vendors, change order status, edit platform fees, and view ads. It has **no gift-card, refund, or payment tooling**.

## Severity snapshot

| Severity | Count | Meaning |
| --- | --- | --- |
| **S0 blocker** | 3 | Journey cannot complete, or the app is likely not to bundle |
| **S1 high** | 10 | Wrong money, broken advertised path, or major dead end |
| **S2 medium** | 10 | Auth/UX gaps, missing screens, client/API drift |
| **S3 low** | 9 | Copy, demo credentials, unused packages, documented mocks |

See [findings.md](./findings.md) for IDs `MM-QA-001` … `MM-QA-032`.

## How to read this audit

| File | Use it for |
| --- | --- |
| [test-matrix.md](./test-matrix.md) | Manual / future automated cases. Columns: Journey · Step · Surface · Preconditions · Expected · How to verify · Priority |
| [findings.md](./findings.md) | Ranked defects. Each has evidence (paths), impact, and a **spec-only** suggested fix |
| [parity-matrix.md](./parity-matrix.md) | Feature-by-feature Expo `customer-app` vs Next `vendor-dashboard/app/shop` |

**Priority in the test matrix** is QA execution order (P0 first), not the same as defect severity. Run P0 rows before calling a build “shoppable”.

### Evidence convention

- Paths are repo-relative (`apps/customer-app/app/(customer)/cart/checkout.tsx`).
- “Static” = confirmed by reading code.
- “Runtime-unverified” = logic is clear but PayGate redirects, Expo deep links, and bundler behaviour were not executed here.

### What is *not* a bug

- PayGate PayWeb 3 is **intentionally mock** (`backend/src/services/paygate/index.ts` always serves `/paygate/mock/...`). README documents this. It is logged as S3 so QA does not treat it as an accidental omission.
- Seeded demo users (`customer@shopping-mall.local`, `Password123!`) are documented in the root README. Prefill on login forms is still an S3 production-hygiene issue.
- Guest browse without an account is **by design**. Auth is required at `POST /orders`, not at add-to-bag.

## Critical journeys (coverage)

| # | Journey | Verdict |
| --- | --- | --- |
| 1 | Guest browse → product → cart → checkout | Navigation complete on Expo and `/shop`. **Pay loop broken on web.** Mock SKUs poison checkout. Wallet math is client-only. |
| 2 | Auth: join / sign-in / register / vendor-login | Password, OTP, magic, passkeys, vendor phone OTP are wired. **OAuth is 501.** Expo vendor desk has no hard route guard. Web header ignores signed-in shoppers. |
| 3 | Vendor sell → dashboard | Register → desk → products / orders / settings / KYC / fees / studio / ads is implemented on both vendor-dashboard and Expo `(vendor)`. Courier “simulate hop” is mock. Ads/studio credits skip payment. |
| 4 | Gift cards / vouchers | List, “purchase”, share/claim, and checkout apply exist as UI. **No backend wallet.** Cross-device claim cannot work. Apply-at-checkout does not change PayGate amount. |
| 5 | Mobile vs web parity | Shared mall IA (courts, gift cards, specials, vouchers, help, sell). **Web missing** payment-return, orders tab, profile, shops directory page, bag line edits, live ad slots. |

## Suggested fix order (spec only)

1. Restore missing brand/icon assets (or stop `require()`-ing them) so Expo can bundle.
2. Add `/shop/checkout/payment-return`, pass `paymentReturnUrl` from web checkout, align `packages/api-client` `orders.create`.
3. Stop merging `mock-*` products into checkout-eligible grids, or badge them and disable Buy.
4. Either implement server-side gift/voucher ledgers or remove checkout discounts and paid “Purchase” CTAs.
5. Hide Google/Apple until OAuth is implemented; show account chrome when a shopper is signed in on `/shop`.
6. Add `/shop/orders` (+ detail) and bag quantity/remove to close the largest shopper parity gaps.

Do not use this folder as a substitute for a runtime smoke on `pnpm dev` once assets and env are present.
