# Findings

Severity-ranked defects from static analysis of `main` @ `a51e9b1`. Suggested fixes are **specs only** — this audit did not change product code.

| Field | Meaning |
| --- | --- |
| **S0** | Blocker — journey cannot complete, or the app is likely not to start/bundle |
| **S1** | High — wrong money, advertised path fails, or a major dead end |
| **S2** | Medium — gating/UX gap, missing screen, client/API drift |
| **S3** | Low — copy, demo leftovers, unused packages, documented mocks |

All items below are **static** unless noted *runtime-unverified*.

---

## S0 — Blockers

### MM-QA-001 — Expo customer-app references PNG assets that are not in the repo

| | |
| --- | --- |
| **Severity** | S0 |
| **Journey** | All Expo shopper / vendor-desk screens that render brand chrome; EAS icon/splash |
| **Surface** | `apps/customer-app` (iOS, Android, Expo web) |
| **Evidence** | `BrandMark` `require('../../assets/mmall-bag.png')` and `mmall-wordmark.png` (`components/brand/BrandMark.tsx`). Home hero `require('../../assets/mmall-web-banner.png')` (`app/(customer)/index.tsx`). Google button `require('../../assets/auth/google.png')` (`components/auth/AuthIcon.tsx`). `app.json` points `icon`, `splash.image`, `android.adaptiveIcon.foregroundImage`, and `web.favicon` at `./assets/*.png`. Workspace `apps/customer-app/assets/` contains only four SVGs under `assets/auth/`. PNGs are not gitignored. |
| **Impact** | Metro typically fails the bundle when `require()` cannot resolve. EAS builds that honour `app.json` icon/splash will also fail or ship empty icons. *Runtime-unverified* (bundle not run here). |
| **Suggested fix** | Commit the missing PNGs (bag, wordmark, banner, icon, splash, adaptive-icon, favicon, `auth/google.png`) **or** replace `require`/`app.json` references with the existing SVGs / vector icons. Keep web public assets in sync (`MM-QA-003`). |

### MM-QA-002 — `/shop` checkout has no payment-return page; backend default return is Expo

| | |
| --- | --- |
| **Severity** | S0 |
| **Journey** | 1 — Guest browse → checkout (web) |
| **Surface** | `apps/vendor-dashboard/app/shop` + `backend` PayGate mock |
| **Evidence** | No `payment-return` route under `apps/vendor-dashboard/app/`. `app/shop/checkout/page.tsx` `orders.create` body omits `paymentReturnUrl`. `packages/api-client` `orders.create` type also omits the field. Backend accepts it (`backend/src/services/orders/index.ts` schema) and defaults return to ``${FRONTEND_URL ?? 'http://localhost:8081'}/cart/payment-return`` (`backend/src/services/paygate/index.ts`). Expo implements the screen at `apps/customer-app/app/(customer)/cart/payment-return.tsx`. |
| **Impact** | After Visa / Instant EFT / decline on mock PayGate, the web shopper leaves `/shop` and lands on the Expo app port (or 404). No order confirmation, no cart recovery, no “view orders”. **Web paid-checkout journey cannot close.** |
| **Suggested fix** | Add `app/shop/checkout/payment-return/page.tsx` that reads `TRANSACTION_STATUS` / `PAY_REQUEST_ID` (mirror Expo). Pass `paymentReturnUrl: ${origin}/shop/checkout/payment-return` on create. Extend the shared client type. Document `FRONTEND_URL` per surface. |

### MM-QA-003 — Next `/shop` chrome images are missing from `public/`

| | |
| --- | --- |
| **Severity** | S0 (broken first paint / trust chrome; Next still compiles) |
| **Journey** | 1, 2, 4, 5 — every `/shop` page using `GuestChrome` |
| **Surface** | `apps/vendor-dashboard` |
| **Evidence** | `components/shop/GuestChrome.tsx` loads `/mmall-bag.png` and `/mmall-wordmark.png`. `BrandLockup` and admin login use `/icon.png`. Auth Google button uses `/auth/google.png`. `apps/vendor-dashboard/public/` contains only `auth/{apple,magic,otp,passkey}.svg`. |
| **Impact** | Header wordmark/bag 404 on every shopper page. Google SSO affordance is a broken image. Not a compile failure; it is a storefront that looks unfinished and fails visual QA. |
| **Suggested fix** | Add the PNGs under `public/` (same art as Expo) or inline SVG lockups. |

---

## S1 — High

### MM-QA-004 — Checkout discounts are UI-only; PayGate charges the full server total

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1, 4 |
| **Surface** | Expo checkout, `/shop` checkout, backend orders |
| **Evidence** | Expo: voucher/gift math in `app/(customer)/cart/checkout.tsx`; `api.orders.create` payload has items + addresses + `shippingServiceCode` + `paymentReturnUrl` only. Web: same pattern in `app/shop/checkout/page.tsx`. Backend sets `totalAmount: subtotal + shippingTotal` and never writes `discountTotal` (`backend/src/services/orders/index.ts`). No gift/voucher routes exist under `backend/`. |
| **Impact** | Button copy shows `Pay with PayGate · R{reduced}`. Mock PayGate page shows the **server** amount. Shopper overpays vs the UI, or abandons. Gift “Apply” is theatre. |
| **Suggested fix** | Accept `voucherCode` / `giftCardCode` on `POST /orders`, validate against a server ledger, persist `discountTotal`, pass the reduced cents into `initiatePaygate`. Until then, show “PayGate total (vouchers are preview-only)” or remove the controls. |

### MM-QA-005 — Gift card “Purchase” mints mall credit with no payment

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 4 |
| **Surface** | Expo `gift-cards/index.tsx`, `/shop/gift-cards`, local wallets |
| **Evidence** | Expo `issueGiftCard(value)` in `stores/walletStore.ts` writes Zustand/AsyncStorage; CTA label is “Purchase {tier}”. Web `issueGiftCard` in `lib/mallWallet.ts` writes `localStorage` key `mmall-wallet`; `buy()` has no `orders.create` / PayGate. No backend gift-card model. |
| **Impact** | Unlimited free credit in the demo wallet. Combined with MM-QA-004 this either does nothing at PayGate (web/Expo paid path) or fully covers a bag with no order (MM-QA-008). Not production-safe; copy implies a paid product. |
| **Suggested fix** | Paid issuance: create a gift-card order, PayGate, credit ledger on `PAID` notify. Or relabel the CTA “Issue demo card (local only)” and keep it behind `__DEV__`. |

### MM-QA-006 — Mock catalog SKUs are merged into live shopping paths

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1, 5 |
| **Surface** | Expo home/browse + `/shop` home/browse/product |
| **Evidence** | Mock IDs `mock-${category}-${index}` in `apps/customer-app/lib/catalog.ts` and `apps/vendor-dashboard/lib/mockCatalog.ts`. Expo home concatenates live + `mockFeatured()` (`app/(customer)/index.tsx`). `/shop` home always renders `mockProductsFor` per court (`app/shop/page.tsx`). Backend `POST /orders` 400s unknown products (`Product ${id} not available`). Web checkout skips `mock-*` and shows “Demo listings cannot be charged through PayGate.” Expo checkout **does not** filter mock IDs. |
| **Impact** | Default guest browse is mostly demo inventory. Expo: checkout fails. Web: bag of court items cannot be paid. Shoppers cannot tell live from mock. |
| **Suggested fix** | Gate mocks on `EXPO_PUBLIC_DEMO_CATALOG` / `NEXT_PUBLIC_DEMO_CATALOG`. Badge “Demo listing”. Disable add-to-bag or Buy for `mock-*`. Prefer live `products.list` for court rails when the API returns items. |

### MM-QA-007 — Inventory is decremented before payment succeeds

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1, 3 (vendor stock) |
| **Surface** | `backend/src/services/orders/index.ts`, PayGate notify |
| **Evidence** | Create transaction decrements `product.inventory` then returns PayGate URL. `applyPaygateNotify` on decline/cancel leaves the order `PENDING` and does not restock (paygate service). |
| **Impact** | Abandoned or declined mock (or live) payments lock stock. Vendors see missing inventory without a paid order. |
| **Suggested fix** | Reserve on create; commit decrement on `PAID`; release on fail/timeout job. |

### MM-QA-008 — Zero-total “mall credit” checkout creates no order (Expo)

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1, 4 |
| **Surface** | `apps/customer-app/app/(customer)/cart/checkout.tsx` |
| **Evidence** | `if (grandTotal <= 0)` redeems the local gift card, `clearCart()`, alerts “Paid with mall credit”, `router.replace('/(customer)/orders')` — **no** `api.orders.create`. |
| **Impact** | Empty orders list, no vendor notification, no inventory movement, no audit trail. The shopper believes they bought the bag. |
| **Suggested fix** | `POST /orders` with a wallet/gift payment method (zero PayGate amount) so vendor orders still exist. |

### MM-QA-009 — Gift card is spent before PayGate success (web always; Expo web)

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1, 4 |
| **Surface** | `/shop` checkout; Expo checkout on web |
| **Evidence** | Web: `redeemGiftCard` then `writeGuestBag([])` then `window.location.href = checkoutUrl` (`app/shop/checkout/page.tsx`). Expo web: `spendGift()` before `window.location.href`. Expo native redeems only on `openAuthSessionAsync` success (better). |
| **Impact** | Cancel/decline burns local gift balance and empties the web basket while the order may remain `PENDING`. |
| **Suggested fix** | Redeem gift + clear bag only on `TRANSACTION_STATUS === '1'` (payment-return). Server-side redeem in notify (see MM-QA-004). |

### MM-QA-010 — Google / Apple SSO is advertised but the API returns 501

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 2 |
| **Surface** | All auth screens + `backend/src/services/auth/index.ts` |
| **Evidence** | `POST /auth/oauth/:provider/start` responds 501 with “Google and Apple SSO need client IDs…”. UI: `NativeAuthMethods.tsx`, `vendor-dashboard/components/auth/AuthMethods.tsx`. Customer-app `request()` throws on non-OK, so the native buttons should alert rather than silently succeed. Native still opens a browser **only if** `start.url` is present (it is not on 501). |
| **Impact** | Every join/login/signup screen offers a path that cannot complete. Copy says “Continue with Google, Apple, a passkey, or email.” |
| **Suggested fix** | Hide OAuth until env client IDs exist **or** implement OIDC. Keep passkey / magic / OTP as the passwordless story. |

### MM-QA-011 — Expo OAuth handler would not persist a session even if the API returned a URL

| | |
| --- | --- |
| **Severity** | S1 (latent; currently masked by 501) |
| **Journey** | 2 |
| **Surface** | `apps/customer-app/components/auth/NativeAuthMethods.tsx` |
| **Evidence** | On `start.url`, `WebBrowser.openAuthSessionAsync(start.url, 'mmall://')` then `return` with no parse of the result URL and no `onSession(...)`. |
| **Impact** | Wiring OAuth on the API without a client callback still leaves shoppers unsigned-in. |
| **Suggested fix** | Parse the auth-session URL, exchange the token, call `onSession`. Add a dedicated `mmall://` OAuth return route. |

### MM-QA-012 — Web shop has no shopper orders or profile surface

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 1 (post-pay), 5 |
| **Surface** | `apps/vendor-dashboard/app/shop` |
| **Evidence** | Expo has tabs `orders` + `orders/[id]` and `profile/index`. Web lists order **ids + status** only on `app/shop/help/page.tsx` (no detail, no PayGate status, no shipments). Footer “Track an order” → `/shop/help#orders`. “Your account” is a signed-in name line, not address/passkey/logout. `GuestChrome` always shows Join + Sign in (MM-QA-016). |
| **Impact** | After a successful web payment (if return were fixed), the shopper has nowhere first-class to confirm the order. Account management is a dead end vs Expo. |
| **Suggested fix** | Add `/shop/orders`, `/shop/orders/[id]`, `/shop/account` (or profile) wired to `api.orders.*` / `api.auth.updateAddress`. Header account menu when `user.role === 'CUSTOMER'`. |

### MM-QA-013 — Studio credit top-up and ad campaign purchase skip payment

| | |
| --- | --- |
| **Severity** | S1 |
| **Journey** | 3 |
| **Surface** | `backend/src/services/studio/index.ts`, `backend/src/services/ads/index.ts`, vendor Advertise / AI Studio screens |
| **Evidence** | Studio top-up increments `paidCredits` with no PayGate. Ads `POST /:id/purchase` flips campaign status to live with no charge. Vendor UI presents these as purchases (`app/advertise/page.tsx`, Expo `dashboard/advertise.tsx`). |
| **Impact** | Free ads and AI generations in any environment that is not strictly local. KYC gates exist; money does not. |
| **Suggested fix** | Initiate PayGate (or wallet debit) before credit increment / campaign activation. Keep a `DEMO_BILLING=true` bypass documented for local. |

---

## S2 — Medium

### MM-QA-014 — Expo vendor desk has no route-level auth guard

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 2, 3 |
| **Surface** | `apps/customer-app/app/(vendor)/_layout.tsx` |
| **Evidence** | Stack only; queries use `enabled: Boolean(token)`. `MallFooter` links “Advertise & fees” to `/(vendor)/dashboard` for everyone. |
| **Impact** | Guests and shoppers reach an empty vendor shell instead of `/(auth)/vendor-login`. |
| **Suggested fix** | If `!token \|\| role !== 'VENDOR'` → replace with vendor-login (`next` back to the desk). |

### MM-QA-015 — Gift card share/claim is same-device local storage only

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 4, 5 |
| **Surface** | `walletStore.ts`, `mallWallet.ts`, claim screens |
| **Evidence** | Claim tokens and balances live in AsyncStorage / `localStorage`. Expo share URL is `Linking.createURL('/gift-cards/claim?t=…')`. Web uses `${origin}/shop/gift-cards/claim?t=…`. Hashes never leave the browser. Expo vs web wallets do not share a ledger. |
| **Impact** | Opening a claim link on another phone/browser always fails (“invalid or expired”). Cross-platform gift is impossible. Copy talks about PIN security the server cannot enforce. |
| **Suggested fix** | Server-issued claim tokens + hashed PINs + `GiftCard` table. |

### MM-QA-016 — `/shop` header ignores signed-in shoppers

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 2, 5 |
| **Surface** | `components/shop/GuestChrome.tsx` |
| **Evidence** | Always renders Join + Sign in. `useAuthStore` is unused in chrome. Sign-out exists only if the user finds help/account copy. Shared persist key `vendor-auth` stores both roles (`stores/authStore.ts`). |
| **Impact** | Logged-in customers (and vendors browsing the mall) still see Join. Easy to create a second session and clobber the first. |
| **Suggested fix** | Branch chrome on session: Hi {firstName}, Orders, Sign out. Namespace storage by role or warn when switching. |

### MM-QA-017 — Web basket cannot change quantity or remove a line

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 1, 5 |
| **Surface** | `app/shop/bag/page.tsx`, `lib/guestBag.ts` |
| **Evidence** | List + “Clear basket” only. `addGuestBagItem` can increment on add-from-PDP; bag page has no `updateQuantity` / `removeItem`. Expo `cart/index.tsx` has +/− and delete. |
| **Impact** | Wrong qty forces clear-all. Parity hole vs mobile. |
| **Suggested fix** | Add helpers and per-line controls; keep `mmall-bag` event so the header badge updates. |

### MM-QA-018 — Shop footer sends shoppers into vendor-gated routes

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 2, 3 |
| **Surface** | `components/shop/GuestFooter.tsx`, `AuthGuard` |
| **Evidence** | Links `/advertise`, `/fees`, `/verify` are **not** in `lib/publicPaths.ts`. Guard sends anonymous users to `/login` and `CUSTOMER` users back to `/shop`. Trust column “PayGate checkout” and “Safe & secure” both `href: '/shop'` (self). |
| **Impact** | Dead ends / bounce loops. “Seller verification” from a shopper footer is confusing. |
| **Suggested fix** | Point shoppers at `/shop/sell` and `/shop/legal/*`. Keep desk URLs behind merchant copy. |

### MM-QA-019 — Customer-app does not use `@shopping-mall/api-client`; create-order types already drifted

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 1 (checkout), platform maintainability |
| **Surface** | `apps/customer-app/lib/api/index.ts` vs `packages/api-client/src/index.ts` |
| **Evidence** | `customer-app/package.json` depends on `api-client` and `shared-ui`; app code imports neither (grep). Local `orders.create(data, token)` can send `paymentReturnUrl`. Shared client type cannot. `sendMagicLink` returns `{ ok }` locally vs `{ sent }` in the package (verify before unifying). |
| **Impact** | Web cannot type-pass the return URL (contributes to MM-QA-002). Two HTTP stacks to keep in sync. |
| **Suggested fix** | Adopt `createApiClient({ baseUrl, getToken })` in Expo, or drop the unused workspace deps. Add `paymentReturnUrl` to the shared create body. |

### MM-QA-020 — Order detail tells signed-out users the order was not found

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 1, 2 |
| **Surface** | `apps/customer-app/app/(customer)/orders/[id].tsx` |
| **Evidence** | Query `enabled: Boolean(id && token)`. When `!token` and not loading, UI is “Order not found”. List screen correctly asks to sign in. |
| **Impact** | Deep links (PayGate → orders, shared links) look like data loss. |
| **Suggested fix** | Mirror the list empty state: Sign in CTA with `next` back to the id. |

### MM-QA-021 — Product options are stored in the bag but omitted from `orders.create`

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 1 |
| **Surface** | Expo cart store, `guestBag.ts`, both checkouts, order items schema |
| **Evidence** | Options render on bag/checkout. Create payload is `{ productId, quantity }` only. Backend order items have no options column usage in create. |
| **Impact** | Size/colour chosen on PDP is not what the vendor fulfils. |
| **Suggested fix** | Persist selected options on `OrderItem` (JSON) and show them on vendor order rows. |

### MM-QA-022 — Passwordless challenges live in process memory

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | 2 |
| **Surface** | `backend/src/services/auth/passwordless.ts`, `passkeys.ts` |
| **Evidence** | In-memory `Map` for OTP / magic / WebAuthn challenges. |
| **Impact** | API restart or a second instance invalidates codes. *Runtime-unverified* multi-instance. |
| **Suggested fix** | Redis/DB with TTL. |

### MM-QA-023 — Admin session is client-persisted role only; ads UI is read-only

| | |
| --- | --- |
| **Severity** | S2 |
| **Journey** | Admin (supporting) |
| **Surface** | `apps/admin-panel` |
| **Evidence** | `AdminGuard` trusts Zustand `user.role === 'ADMIN'` without `api.auth.me` on boot. Ads page lists campaigns with no approve/pause. `api.admin.vendors.updateCommission` unused. Revenue chart in `backend/src/routes/admin.ts` sums orders by day without requiring `paymentStatus: 'PAID'` (dashboard KPI already filters PAID — inconsistency). |
| **Impact** | Stale tokens after demotion; operators cannot moderate ads they can see; revenue chart can include unpaid. |
| **Suggested fix** | Revalidate `/auth/me` on load. Add campaign actions. Filter revenue series to PAID. |

---

## S3 — Low

### MM-QA-024 — Bag vs basket vs cart; Loved vs Saved; MMall vs M-MALL

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | 5 (copy) |
| **Surface** | Both shopper UIs |
| **Evidence** | Expo tab title “Cart”, empty state “Your bag”, footer/chrome “Basket” in places. Web page title “Basket”, route `/shop/bag`, aria “Basket”. Header “Loved items” vs Expo saved screen “Saved”. Brand: `alt="M-MALL"`, footer “M-MALL”, admin “MMall”, phone copy “0860 MMALL 00”. Join card “General user” vs “shopper”. |
| **Impact** | Does not break flows; hurts scan tests and localisation. |
| **Suggested fix** | Pick one noun per concept (recommend: Bag, Saved, MMall) and apply in chrome, tabs, and empty states. |

### MM-QA-025 — Help-desk contact forms do not send mail

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | Help |
| **Surface** | Expo `help/index.tsx` (“Preview builds do not email the mall yet.”); web `shop/help/page.tsx` (`setSent(true)` only) |
| **Impact** | False confirmation. |
| **Suggested fix** | `mailto:` or tickets API; or keep the honest Expo copy on web too. |

### MM-QA-026 — Demo credentials prefilled on login forms

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | 2 |
| **Surface** | Expo `login.tsx`; `/shop/login`; `/login`; admin `login/page.tsx` |
| **Evidence** | Default `customer@` / `vendor@` / `admin@shopping-mall.local` + `Password123!`. Matches README seed table. |
| **Impact** | Convenient locally; dangerous if a production build ships the prefill. |
| **Suggested fix** | Prefill only when `NODE_ENV !== 'production'` / `__DEV__`. |

### MM-QA-027 — PayGate is permanently mock (documented)

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | 1 |
| **Surface** | `backend/src/services/paygate/index.ts` |
| **Evidence** | `checkoutUrl` always `${API_PUBLIC_URL}/paygate/mock/${id}`. README: “PayGate PayWeb 3 (mock locally)”. Checkout copy: “Mock PayWeb checkout — Visa or Instant EFT.” |
| **Impact** | No live card/EFT. Expected for this repo stage; still a go-live gate. |
| **Suggested fix** | `PAYGATE_MODE=live\|mock` posting to real PayWeb when live. |

### MM-QA-028 — Expo checkout has no empty-cart redirect

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | 1 |
| **Surface** | `app/(customer)/cart/checkout.tsx` |
| **Evidence** | Web checkout shows “Your basket is empty.” Expo checkout always renders the form. `POST /orders` requires `items.min(1)` so place-order fails if someone deep-links. |
| **Impact** | Confusing empty summary; API 400 if they proceed signed-in. |
| **Suggested fix** | Redirect to cart when `items.length === 0`. |

### MM-QA-029 — `@shopping-mall/shared-ui` is unused

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | Platform |
| **Surface** | `packages/shared-ui`; app `package.json` files |
| **Evidence** | No app imports. Each app uses local buttons/cards. |
| **Impact** | Visual drift; dead package. |
| **Suggested fix** | Adopt shared primitives or drop the workspace dependency. |

### MM-QA-030 — Notification jobs and KYC provider are stubs

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | 1 (order emails), 3 (KYC) |
| **Surface** | `backend/src/services/notifications/index.ts` (console.log workers); `backend/src/services/kyc/provider.ts` (`KYC_STUB_AUTO_APPROVE`) |
| **Impact** | No real email/push; KYC can auto-approve in demo. Vendor verify UI includes “demo liveness” (`app/verify/page.tsx`). |
| **Suggested fix** | Document env flags in README; integrate FCM HTTP v1 and a KYC vendor when leaving demo. |

### MM-QA-031 — Dead `/api/v1/payments/webhook` middleware; unauthenticated ads-refresh

| | |
| --- | --- |
| **Severity** | S3 |
| **Journey** | Payments / ads ops |
| **Surface** | `backend/src/index.ts` (`express.raw` for a path with no handler); `backend/src/services/events/index.ts` `POST /ads-refresh` |
| **Impact** | Confusing API surface; anyone can ping SSE ad refresh. |
| **Suggested fix** | Remove unused raw parser or add the handler. Require admin/secret on ads-refresh. |

### MM-QA-032 — Default JWT secret fallback

| | |
| --- | --- |
| **Severity** | S3 in local demo; **promote to S0** if this binary is internet-facing with the fallback |
| **Journey** | 2 (all auth) |
| **Surface** | `backend/src/shared/middleware/auth.ts` (`JWT_SECRET ?? 'dev-only-change-me'`) |
| **Impact** | Token forgery if production forgets env. |
| **Suggested fix** | Refuse to listen when `NODE_ENV=production` and secret is missing/default. |

---

## Journeys that look complete (with caveats)

These are **not** empty because the code is clean — they work until they hit the S0/S1 items above.

| Journey | What is actually wired |
| --- | --- |
| Guest browse → PDP → bag | File-based routes exist on Expo and `/shop`. Add-to-bag persists (Zustand/AsyncStorage vs `mmall-guest-bag`). |
| Auth password / email OTP / magic / passkeys / vendor phone OTP | Backend routes + UI. Role split: shopper login rejects `VENDOR`; vendor login sends `CUSTOMER` to `/shop`. |
| Vendor register → desk | `registerVendor` from `/(auth)/sell`, `/shop/sell`, `/signup`. Dashboard: products CRUD, orders + courier book, store settings, fees/payout register, KYC wizard, studio, advertise. |
| Admin vendor approve / order status / settings | `apps/admin-panel` pages call `api.admin.*` and `api.kyc.review`. |

---

## Open questions for a runtime pass

1. Does Metro fail immediately on `BrandMark` require, or only when the screen mounts? (MM-QA-001)
2. Expo Router `next=/cart/checkout` after login — groups are omitted from URLs, so this **may work**; not logged as a defect. Confirm on device.
3. Mock PayGate HTML form action is `/paygate/mock/:id/complete` (relative). Confirm it posts to the API host when the mock page is served from `API_PUBLIC_URL`.
4. Passkeys: WebAuthn only where `passkeysAvailable()` is true (Safari/Chrome). Expected.
5. `FRONTEND_URL` / `EXPO_PUBLIC_API_URL` / `NEXT_PUBLIC_API_URL` in a real `.env` may change MM-QA-002’s landing host — the missing `/shop` return **page** remains.
