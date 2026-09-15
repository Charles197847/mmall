# M-MALL quality audit — web + mobile

**Date:** 15 Sep 2026  
**Baseline:** PR [#1](https://github.com/Charles197847/mmall/pull/1) / `cursor/mobile-shopper-polish-4684` (this working view)  
**Compared to:** `main` (still **missing** the PR #1 phone polish)  
**Method:** Source review of every Expo and Next.js route. Findings are file-backed. Layout claims that do not depend on runtime (fixed `grid-cols-4`, `w-64` sidebar, one-row header) are treated as confirmed. Native iOS/Android home-indicator behaviour was **not** re-run on a device (same gap as PR #1).

No product redesign. No drive-by refactors in this PR.

---

## Executive summary — fix this first

PR #1 made the **Expo shopper app** usable on a phone. The remaining pain is not more chrome tweaks on Home. It is:

1. **Gift cards and vouchers look real and are not.** “Purchase” writes a local PIN. There is **no backend wallet**. Mobile hashes with djb2; web hashes with SHA-256; both persist under `mmall-wallet` in incompatible shapes. A card bought in one surface cannot be redeemed in the other. Mobile checkout can “pay” a bag to R0 and jump to Orders **without creating an order**.
2. **Customer web never got the PR #1 treatment.** Shopper web lives inside `apps/vendor-dashboard` at `/shop/*`. `GuestChrome` is still a single non-wrapping desktop header (logo + Deliver to + search + four promises + bag/love + theme + Join + Sign in). Product grids are `grid-cols-4` on every width. This is the same class of overflow PR #1 fixed in Expo.
3. **Vendor and admin consoles are desktop-only.** Permanent `w-64` sidebar, no hamburger, tables without horizontal scroll. Unusable on a phone.
4. **Two shopper products, one vendor store.** Expo (`apps/customer-app`) and Next (`/shop`) duplicate browse → bag → checkout → gifts. Carts, saved lists, and wallets do not sync. Root metadata on the Next app is still `Vendor · MMall`. Shop chrome always shows Join / Sign in.
5. **Demo listings and demo logins leak into the happy path.** Mock SKUs checkout on mobile (API 400). Web shop blocks them. Every web + admin + shopper-login form prefills `Password123!`.

**Suggested first slices (not this PR):**

| Slice | Owner | Why |
| --- | --- | --- |
| A. Gift/voucher honesty + one wallet (or kill “Purchase” until PayGate + API exist) | eng | Stops fake money |
| B. Port PR #1 chrome/grids to Next `/shop` | web | Phone web is still broken |
| C. Vendor + admin responsive shell (drawer) | web | Dashboards fail on phone |
| D. Mock-SKU checkout guard on Expo (copy web) | mobile | Closes a dead-end checkout |
| E. Strip demo credential prefills; gate OTP/magic hints to `__DEV__` | qa + mobile + web | Prod-shaped auth |

---

## What PR #1 already addressed (do not re-open)

Closed on **this branch**. Still **open on `main`** until #1 merges.

| Closed | Where |
| --- | --- |
| MallChrome one-row overflow → two-row chrome (brand + 40px icons; Deliver to + one search) | `apps/customer-app/components/mall/MallChrome.tsx` |
| Compact brand mark for iPhone SE widths | `apps/customer-app/components/brand/BrandMark.tsx` |
| ShopPromises removed from header | MallChrome vs `ShopPromises.tsx` |
| FilterBar compact chips; no dashboard “Filter” heading | `components/mall/FilterBar.tsx` |
| Filter + Deliver To as bottom sheets with safe-area padding | `FilterBar.tsx`, `DeliverTo.tsx` |
| Tab bar `useSafeAreaInsets` (home indicator) | `app/(customer)/_layout.tsx` |
| Profile `headerShown: false`; no double BrandMark | `(customer)/_layout.tsx`, `profile/index.tsx` |
| Sticky mall chrome on product + vendor; in-page Back on product | `product/[id].tsx`, `vendor/[slug].tsx` |
| Tighter type/spacing: home, browse (duplicate search dropped), specials, bestsellers, help, gifts, vouchers, rails, directory, footer | listed screens + `PageTitle.tsx`, `lib/layout.ts` |
| Larger qty / chip / footer targets (40–44px tokens) | `lib/layout.ts` + cart/product |
| Theme-aware `palettes[mode]` on cart, checkout, orders, profile | those screens |
| Vendor `DeskShell` real safe-area padding + 40px nav chips | `components/vendor/DeskShell.tsx` |

**PR #1 explicitly deferred (still open below, not “regressed”):** MallFooter stacked sitemap; vendor desk chip nav (not a tab bar); auth demo prefills; unused `FilterChips.tsx`; search submit-only; `AdPopup` timing.

---

## `main` vs this branch

`git log origin/main..HEAD` is only the two polish commits. **Auditing `main` as if PR #1 had shipped would re-report overflow, filter headings, and unsafe tab padding as open.** Merge #1 before any follow-up polish, or branch follow-ups from `cursor/mobile-shopper-polish-4684`.

---

## Severity

| Sev | Meaning |
| --- | --- |
| **P0** | Core journey blocked, or the UI presents paid value that is not real |
| **P1** | Common viewport / role / empty-error failure; user gets stuck or misled |
| **P2** | Polish, a11y, tap-target, consistency; should not block a release of #1 |

---

## P0 — ranked backlog

| ID | Sev | Surface / screen | Path | One-line issue | Owner |
| --- | --- | --- | --- | --- | --- |
| **X-01** | P0 | Gift cards (all shopper surfaces) | Mobile `stores/walletStore.ts` (`hashValue` ~L65, persist `mmall-wallet` ~L203); web `apps/vendor-dashboard/lib/mallWallet.ts` (`KEY = 'mmall-wallet'` L38, `sha256Hex` L68, `issueGiftCard` L136). Routes: `/(customer)/gift-cards`, `/shop/gift-cards` | “Purchase” issues a local card with **no PayGate and no API**. PIN hashing and persist format differ; Expo web + Next `/shop` can corrupt each other’s `mmall-wallet`. | eng |
| **X-02** | P0 | Checkout paid with mall credit | `apps/customer-app/app/(customer)/cart/checkout.tsx` L128–133 → `/(customer)/cart/checkout` | If gift+voucher cover the bag, cart clears, alert says paid, then **Orders** — **no `api.orders.create`**. | mobile |
| **X-03** | P0 | Gift / voucher product claim | Backend: `grep gift\|voucher\|wallet` under `backend/src` → **none**. Legal/help still promise mall-wide cards. | UI/legal promise a platform wallet that does not exist server-side. | eng |
| **W-01** | P0 | Next shop header (phone/tablet) | `apps/vendor-dashboard/components/shop/GuestChrome.tsx` L15–32 → all `/shop/*` | One non-wrapping row: bag logo + wordmark + Deliver to + search + `ShopPromises` (4 icons, `shrink-0`) + bag/love + theme + Join + Sign in. Same overflow class PR #1 fixed in Expo. | web |
| **W-02** | P0 | Next shop listing grids | `app/shop/browse/page.tsx` L41 `grid-cols-4`; `components/shop/ProductGrid.tsx`; store/saved/specials/bestsellers; PDP `app/shop/product/[id]/page.tsx` L76 `grid-cols-2`; checkout L178 `grid-cols-2`; gifts/vouchers `grid-cols-3`; footer `GuestFooter.tsx` L54 `grid-cols-4` | Desktop column counts on every width — unreadable on a phone. | web |
| **W-03** | P0 | Vendor console on phone | `apps/vendor-dashboard/components/layout/Sidebar.tsx` L21 `w-64`; `AppShell.tsx` L26–30 always mounts sidebar | No collapse / hamburger. Eight nav items + content cannot share ~390px. | web |
| **W-04** | P0 | Admin console on phone | `apps/admin-panel/components/layout/Sidebar.tsx` L19 `w-64`; `AppShell.tsx` L13–18 | Same permanent sidebar. Tables (`vendors`, `users`, `orders`, `ads`) have no `overflow-x-auto`. | web |

---

## P1 — ranked backlog

| ID | Sev | Surface / screen | Path | One-line issue | Owner |
| --- | --- | --- | --- | --- | --- |
| **X-04** | P1 | Dual shopper apps | Expo `apps/customer-app` vs Next `apps/vendor-dashboard/app/shop/*`. README says Expo covers web. | Two full malls: separate bags (`cartStore` vs `guestBag`), saved keys (`mmall-saved` vs `mmall-guest-love`), wallets (X-01). No IA that says which is canonical. | eng |
| **X-05** | P1 | Mock catalog → PayGate | Mobile checkout still `api.orders.create` for `mock-*` IDs (`checkout.tsx` L89–92 skip quote only; L148–157 always create). Backend `backend/src/services/orders/index.ts` L63–64 `Product … not available`. Web `app/shop/checkout/page.tsx` L130–132 **does** block demo SKUs. | Shopper can fill checkout from Home rails and get a 400. Web already has the copy to reuse. | mobile |
| **X-06** | P1 | Shopper vs vendor in one Next app | `app/layout.tsx` L11–14 title `Vendor · MMall`; `stores/authStore.ts` L20 persist `vendor-auth`; `GuestChrome.tsx` L26–31 always Join/Sign in (no `useAuthStore`) | Shopper session is stored as vendor-auth; header never shows account or sign-out; browser tab says Vendor. | web |
| **X-07** | P1 | Footer → vendor-only routes | Mobile `MallFooter.tsx` L20 `Advertise & fees` → `/(vendor)/dashboard`. Web `GuestFooter.tsx` L19–20 `/advertise`, `/fees`; L40 `/verify` — none in `lib/publicPaths.ts` | Shoppers hit merchant login wall or an unguarded Expo desk. | web / mobile |
| **M-01** | P1 | Expo vendor desk unguarded | `app/(vendor)/_layout.tsx` — no role check. `DeskShell.tsx` still renders for guests. Footer deep-links here. Web uses `AuthGuard requiredRole="VENDOR"`. | Any shopper can open Overview/Products/Orders chrome; APIs no-op without token. | mobile |
| **M-02** | P1 | Product / store loading & not-found | `product/[id].tsx` L54–69; `vendor/[slug].tsx` L28–33 | Spinner / “not available” / “Store not found” **drop MallChrome and Back** (product not-found has Browse only). | mobile |
| **M-03** | P1 | Auth + checkout keyboard | Project-wide: **zero** `KeyboardAvoidingView`. Screens: `(auth)/login`, `register`, `sell`, `vendor-login`, `cart/checkout`, `help` contact. | Password, OTP, and address fields sit under the keyboard on small phones. | mobile |
| **M-04** | P1 | Demo shopper login prefill | `app/(auth)/login.tsx` L16–17 `customer@shopping-mall.local` / `Password123!`. Web shop `app/shop/login/page.tsx` L16–17; vendor `app/login/page.tsx` L17–18; admin `app/login/page.tsx` L12–13. Expo **vendor-login is empty** (inconsistent). | Seed passwords ship in the production-shaped UI. PR #1 deferred this. | qa / mobile / web |
| **M-05** | P1 | Cart / Orders vs Mall chrome | `cart/_layout.tsx` L8–11 titles Cart/Checkout/PayGate; `orders/_layout.tsx` L8–10; Home/Browse/Shops `headerShown: false` + MallChrome. Checkout also H1 “Checkout” (`checkout.tsx` ~L197) | Native stack header + mall language; double title on checkout. | mobile |
| **M-06** | P1 | Chrome search vs browse `q` | `MallChrome.tsx` L54 `useState('')` never reads route; browse `browse/index.tsx` shows `Results for "…"`. Search only `onSubmitEditing` (PR #1 deferred live search). | After submit the field looks unused; easy to miss IME search on phone. | mobile |
| **M-07** | P1 | Vendor storefront Back | `vendor/[slug].tsx` L36–50 MallChrome + grid; product has `‹ Back` | Inconsistent wayfinding after PR #1 sticky chrome. | mobile |
| **M-08** | P1 | Auth stack no in-app back | `(auth)/_layout.tsx` L9–13 `headerShown: false` on login/register/join/sell/vendor-login | Only system gesture to leave Join/Sign in. | mobile |
| **M-09** | P1 | Gift wallet vs account copy | Wallet is device AsyncStorage (`walletStore.ts`); help account copy (`help/index.tsx` L110–113) talks about sign-in for checkout, not device-local cards. Gift screen has no “on this device” line. | Guests and signed-in users share one phone wallet with no explanation. | mobile |
| **W-05** | P1 | Next bag cannot edit lines | `app/shop/bag/page.tsx` L32–68 — qty shown, **no stepper / remove**; only Clear basket | Cannot fix a wrong qty without emptying the bag. Expo cart has steppers. | web |
| **W-06** | P1 | Duplicate vendor signup | `/signup` (`app/signup/page.tsx`) and `/shop/sell` (`app/shop/sell/page.tsx`) both `registerVendor` → `/` | Two onboarding chromes; Join also links Sell. | web |
| **W-07** | P1 | Mock + live catalog on Next home | `app/shop/page.tsx` L28–31, L47–50 category rails are **mock-only** | Featured mixes API + mock; courts are fake SKUs that fail checkout unless W/X-05. | qa / web |
| **W-08** | P1 | Vendor products / orders loading | `app/products/page.tsx` L19–22 no `isLoading`; `app/orders/page.tsx` L11–14; `ProductTable.tsx` L24 empty `<tbody>` | Blank table while fetching; empty catalog looks like a broken table. | web |
| **W-09** | P1 | Product form currency | `ProductForm.tsx` L142, L152 `Price ($)` / `Compare Price ($)` vs `money()` → `R` (`GuestChrome.tsx` L41–42) and table `R{price}` | Vendors enter ZAR under a USD label. | web |
| **W-10** | P1 | KYC upload is filename-only | `app/verify/page.tsx` `onFile(file.name)`; L187–193 “Use demo liveness capture” | Verify looks like a real KYC flow; files never leave the browser. | eng |
| **W-11** | P1 | Shop ↔ desk nav gap | Vendor `Sidebar.tsx` L7–16 no `/shop`; `Header.tsx` email + sign-out only. Shop has no “Vendor desk” when `role === VENDOR`. | Merchants cannot jump storefront ↔ console. | web |
| **W-12** | P1 | Terms → `/fees` while logged out | `TermsAccept.tsx` L36–38; `/fees` not public | Vendor signup “fee schedule” opens merchant login in a new tab. | web |
| **A-01** | P1 | Admin list pages swallow errors | `vendors/page.tsx` L19–22, users, orders, ads, dashboard — `isLoading` only, no `isError` | Failed API → empty table, looks like zero data. | web |
| **A-02** | P1 | Settings save-before-load | `admin-panel/app/settings/page.tsx` L9–31 `useState(emptySettings)`; submit L61 always posts local state | If GET fails, Save can overwrite platform fees with hardcoded defaults (commission 10%, R599/mo, …). | web |
| **A-03** | P1 | Admin mutations have no toast | `vendors/page.tsx` L30–49 approve/suspend/KYC; `users/page.tsx` L16–18 role change | Click Approve → silence on failure. | web |
| **A-04** | P1 | Per-vendor commission unused | Vendors “Category rates” → `/settings` (`vendors/page.tsx` ~L149). `api.admin.vendors.updateCommission` only in `packages/api-client/src/index.ts` L254 | API exists; UI edits global fees only. | web |
| **X-08** | P1 | Role handling mismatch | Expo shopper login **blocks** VENDOR (`login.tsx` L24–27). Next vendor login **redirects CUSTOMER to `/shop`** (`app/login/page.tsx` L22–26). Expo vendor-login blocks non-VENDOR. | Same wrong-role email behaves differently per app. | qa |
| **H-01** | P1 | Help contact is a stub | Mobile `help/index.tsx` L151–156 Alert “Preview builds do not email”. Web `shop/help/page.tsx` L117–133 `setSent(true)` — copy says a desk agent will reply. | Success UX, no ticket. | eng |
| **H-02** | P1 | Returns have no action | Help/legal: “Start a return from the order” (`legalDocs.ts` L41; web help L93–94). `orders/[id].tsx` is status + tracking only. Footer “Returns” → help copy. | Dead end after a delivered order. | eng |

---

## P2 — ranked backlog (grouped)

| ID | Sev | Surface / screen | Path | One-line issue | Owner |
| --- | --- | --- | --- | --- | --- |
| **M-10** | P2 | MallFooter sitemap (PR #1 deferred) | `MallFooter.tsx` L50–63 stacked 4 columns; link `minHeight: 40`; Gift cards listed twice (L11 and L28) | Long scroll; duplicate gift-card entries; 40px rows. | mobile |
| **M-11** | P2 | Vendor desk chips (PR #1 deferred) | `DeskShell.tsx` L47–68 eight 40px chips, horizontal scroll | Not a tab bar; 8 destinations fall off iPhone SE. | mobile |
| **M-12** | P2 | Tap targets still 36–40px | `lib/layout.ts` `chip`/`icon` = 40; cart Clear basket 36 (`cart/index.tsx` L115); FilterBar “Clear all”; product option chips `py-2` (`product/[id].tsx` ~L174); voucher modal `py-2`; gift preset 40px; ProductRail “See all” text + `hitSlop={8}` | Below 44pt HIG; intentional in #1, still a QA fail on SE. | mobile |
| **M-13** | P2 | AdPopup frequency + inset (deferred) | `AdPopup.tsx` L7–8 8s then every 40s; modal card no safe-area | Interrupts browse; can sit under home indicator. | mobile |
| **M-14** | P2 | Unused FilterChips | `components/mall/FilterChips.tsx` — no importers; old “Filter” heading + `mb-10` | Dead code from pre-#1 FilterBar. | eng |
| **M-15** | P2 | Theme leftovers | `cart/payment-return.tsx` L27 spinner `#3DE8FF`; `NativeAuthMethods.tsx` Google hex `#1f1f1f` / `#FFFFFF` | Light/dark mismatch on PayGate return and auth. | mobile |
| **M-16** | P2 | Empty filter results | `specials/index.tsx` L16–35; bestsellers same pattern | FilterBar can zero the grid with no “no matches”. | mobile |
| **M-17** | P2 | Register / sell checkbox | `register.tsx` / `sell.tsx` accepted state is `bg-brand` empty box — **no checkmark**, no `accessibilityState` | Looks unticked when ticked. | mobile / qa |
| **M-18** | P2 | Dev OTP / magic in UI | `NativeAuthMethods.tsx` L118, L132 `Dev link ready` / `Dev code:`; sell screen similar | Preview convenience; must not ship un-gated. | eng |
| **M-19** | P2 | Vendor product form defaults | `(vendor)/dashboard/products.tsx` price `'199'`, inventory `'24'` | Easy to publish dummy SKUs. | eng |
| **M-20** | P2 | Profile guest links / address a11y | `profile/index.tsx` sign-in `Link`s without 44px padding; address fields lack `accessibilityLabel` (checkout has them) | Weak a11y vs checkout. | qa |
| **M-21** | P2 | iPhone SE search row | `MallChrome.tsx` L111 Deliver To `max-w-[42%]` | Search field still cramped beside pin on 320–375px. | mobile |
| **M-22** | P2 | Order detail error | `orders/[id].tsx` L20–25 “Order not found” no retry | Dead end if id/token wrong. | mobile |
| **W-13** | P2 | Next shop a11y | Checkout/verify **placeholder-only** inputs; product table thumbs `alt=""`; gift modal missing `role="dialog"` (FilterBar does it right); ProductForm `×` remove-image unlabeled; overlay not `aria-modal` | Keyboard/SR gaps on money and KYC forms. | qa |
| **W-14** | P2 | Delete product, no confirm | `ProductTable.tsx` L46–47 | Immediate destroy. | web |
| **W-15** | P2 | Dark theme clash on vendor pages | studio / advertise / fees / orders `bg-white` panels in `bg-grid` shell; admin list pages same (`bg-white` / `bg-gray-50`) vs dashboard `mm-card` | Light tables on dark shell. | web |
| **W-16** | P2 | Footer trust placeholders | `GuestFooter.tsx` L35–36 “PayGate checkout” and “Safe & secure” both `href="/shop"` | Dead labels. | web |
| **W-17** | P2 | Advertise table | `app/advertise/page.tsx` 8-col `<table>` no `overflow-x-auto` | Horizontal clip on tablet. | web |
| **W-18** | P2 | Help / store loading | Browse no empty-filter copy; `store/[slug]` no loading/error (falls through to mock). | Blank or wrong shop. | web |
| **W-19** | P2 | AuthGuard flash | `AuthGuard.tsx` L28 “Checking session…” | Unauthenticated vendors see a stub before `/login`. | web |
| **W-20** | P2 | Orders copy | `app/orders/page.tsx` L29 “mock tracking hops” | Internal tone on a merchant screen. | qa |
| **A-05** | P2 | Admin login a11y | `login/page.tsx` L41–51 unlabeled inputs, email field not `type="email"` | Contrast with the rest of auth. | web |
| **A-06** | P2 | Admin ads read-only | `ads/page.tsx` table only | No approve/end despite campaign statuses. | web |
| **A-07** | P2 | Admin theme toggle | `ThemeToggle.tsx` no `aria-label` | Icon-only control. | qa |
| **A-08** | P2 | Admin empty vendors | `vendors/page.tsx` map-only tbody (orders page **does** have empty copy) | Inconsistent empty states. | web |
| **S-01** | P2 | `packages/shared-ui` unused | RN `Button`/`Card`; **zero** runtime imports; hardcoded `#ffffff` | Dead package; web cannot use it. | eng |

---

## Journeys — dead ends and parity

### Guest browse → product → cart → checkout

| Step | Expo `customer-app` | Next `/shop` | Gap |
| --- | --- | --- | --- |
| Home / courts | MallChrome (post-#1) | GuestChrome (pre-#1 overflow) | **W-01** |
| Product | Sticky chrome + Back | Breadcrumbs + `grid-cols-2` | **W-02**, **M-02** on error |
| Bag | Qty steppers, theme palettes | Display qty, clear-all only | **W-05** |
| Checkout | PayGate; **mock SKUs not blocked** | Blocks `mock-*` with copy | **X-05** |
| Gift cover to R0 | Fake success → Orders | Notes demo; no order | **X-02** |
| Persistence | Zustand cart | `localStorage` guest bag | **X-04** |

### Auth join / sign-in

| Role | Expo | Next | Admin |
| --- | --- | --- | --- |
| Shopper | `/(auth)/join`, `login`, `register` | `/shop/join`, `/shop/login`, `/shop/signup` | — |
| Vendor | `/(auth)/sell`, `vendor-login` | `/shop/sell`, `/signup`, `/login` | — |
| Admin | — | — | `/login` |
| Prefill | Shopper yes; vendor **no** | Shopper + vendor yes | Yes |
| Wrong role | Alert, stay | Customer on vendor login → `/shop` | Role error |

### Vendor sell → dashboard

- Expo CourtNav “Sell” → `/(auth)/sell` → `/(vendor)/dashboard` (**no AuthGuard** — **M-01**).
- Next `/shop/join` → Open a store → `/shop/sell` or `/signup` → AuthGuard console.
- Admin `/vendors` approve/KYC; per-vendor commission API unwired (**A-04**).
- KYC “uploads” are filenames + demo selfie (**W-10**).

### Gift cards / vouchers

| Capability | Expo | Next shop | Admin / API |
| --- | --- | --- | --- |
| Buy card | Local `issueGiftCard` | Local `issueGiftCard` | **None** |
| Claim link | `/(customer)/gift-cards/claim` | `/shop/gift-cards/claim` | — |
| Redeem at checkout | Client peek/redeem | Client peek/redeem | — |
| Cross-app redeem | **Broken (hash + persist)** | **Broken** | — |
| Promotional vouchers | Hardcoded `shopVouchers` | Duplicated list | — |

### Orders / saved / help

- Shopper order **detail** exists only in Expo (`/(customer)/orders/[id]`). Next lists IDs on `/shop/help#orders` with no detail route.
- Saved lists use different keys; Expo copy says loved listings stay on this phone.
- Help/legal mention returns; **no return mutation**.
- Contact forms are local stubs (**H-01**).

---

## Route maps (audit coverage)

### Expo `apps/customer-app`

| Zone | Routes |
| --- | --- |
| Shopper tabs | `/(customer)` home, `/browse`, `/stores`, `/cart`, `/orders`, `/profile` |
| Hidden shopper | `/product/[id]`, `/vendor/[slug]`, `/saved`, `/help`, `/specials`, `/bestsellers`, `/vouchers`, `/gift-cards`, `/gift-cards/claim`, `/cart/checkout`, `/cart/payment-return`, `/orders/[id]` |
| Auth | `/login`, `/register`, `/join`, `/sell`, `/vendor-login`, `/legal-*` |
| Vendor desk | `/(vendor)/dashboard` + products, orders, advertise, studio, settings, fees, verify; `/(vendor)/store/[slug]` |

### Next `apps/vendor-dashboard`

| Zone | Routes | Shell |
| --- | --- | --- |
| Public mall | `/shop`, `/browse`, `/product/[id]`, `/store/[slug]`, `/bag`, `/checkout`, `/saved`, `/specials`, `/bestsellers`, `/gift-cards`, `/gift-cards/claim`, `/vouchers`, `/help`, `/legal/*`, `/join` | `GuestChrome` |
| Shopper auth | `/shop/login`, `/shop/signup` | `AuthChrome` |
| Vendor auth | `/login`, `/signup` | `AuthChrome` |
| Sell inside shop | `/shop/sell` | `GuestChrome` |
| Vendor console | `/`, `/products`, `/orders`, `/studio`, `/advertise`, `/store/settings`, `/fees`, `/verify` | Sidebar + `AuthGuard VENDOR` |

Public path helper: `lib/publicPaths.ts` — `/login`, `/signup`, `/shop`, `/shop/*` only.

### Next `apps/admin-panel`

`/` → `/dashboard`; `/login`; `/vendors`; `/orders`; `/ads`; `/users`; `/settings`. `AdminGuard` requires `ADMIN`.

---

## Screens that look OK after PR #1 (Expo)

Do not spend a polish cycle here unless touching shared chrome:

Home, Browse (happy path), Shops, Saved, Specials/Bestsellers (layout; empty-filter is **M-16**), Help chrome, Gift/claim/voucher chrome, Product happy path, Profile signed-in, Cart empty/filled, Checkout happy path (except mock SKUs / gift-cover), Orders list guest/empty, Join split, legal docs, Deliver To / Filter sheets, tab bar insets, ProductCard / LoveButton targets.

---

## Suggested owners for the next four PRs

1. **eng — Wallet honesty (X-01, X-02, X-03):** Stop calling local issue “Purchase”, or put cards behind PayGate + a single API. Do not unify hashes until there is a server ledger.
2. **web — Shop phone pass (W-01, W-02, W-05):** Repeat PR #1 patterns: two-row header, hide ShopPromises on small widths, `grid-cols-2` listings, bag qty controls. Session-aware chrome (X-06).
3. **web — Console phone pass (W-03, W-04, W-08, A-01, A-02):** Drawer nav; don’t save admin settings until GET succeeds; error/empty on tables.
4. **mobile — Journey patches (X-05, M-01, M-02, M-03, M-04, M-05):** Mock-SKU guard, vendor desk AuthGuard, chrome on product error, KeyboardAvoidingView, remove login prefills, cart/orders header alignment.

---

## Out of scope (intentionally not findings)

- Visual redesign of the mall brand, type, or court IA.
- NativeWind vs inline style mix (noted in PR #1; not user-visible).
- Building a real returns/KYC/helpdesk backend — flagged as dead ends only.
- Re-litigating 40px vs 44px as a P0; tokens were an explicit #1 tradeoff (**M-12** is P2).
