# Test matrix

Manual cases for the four critical journeys plus mobile/web parity. **Priority** is execution order (P0 first), not defect severity.

| Legend | |
| --- | --- |
| **Surface** | `mobile` = Expo iOS/Android; `expo-web` = Expo web (`pnpm --filter customer-app web`); `shop-web` = Next `/shop`; `vendor` = Next vendor console; `vendor-mobile` = Expo `(vendor)` desk; `admin` = admin-panel; `api` = Express |
| **How to verify** | Static pointers are included so cases can be run later without re-discovering files. This audit did **not** execute the stack. |
| **Related** | Finding IDs in [findings.md](./findings.md) |

---

## Journey 1 — Guest browse → product → cart → checkout

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1-01 | Browse | Open mall home | mobile, expo-web | Cold start, no session | Mall chrome, courts, featured rails, guest allowed | `app/(customer)/index.tsx`; tab Mall | P0 |
| T1-02 | Browse | Open mall home | shop-web | Cold start, no session | `/shop` GuestChrome, CourtNav, store rail, category rails | `app/shop/page.tsx` | P0 |
| T1-03 | Browse | Brand images render | mobile, expo-web, shop-web | — | Bag + wordmark visible | Expo `BrandMark` requires PNGs (**MM-QA-001**). Shop `GuestChrome` `/mmall-bag.png` (**MM-QA-003**). | P0 |
| T1-04 | Browse | Search / courts | mobile, shop-web | — | Query reaches browse; filters apply | Expo `browse/index.tsx` + `FilterBar`; shop `HeaderSearch` → `/shop/browse?q=` | P1 |
| T1-05 | Browse | Dedicated shops directory | mobile | — | Shops tab lists vendors | `stores/index.tsx` | P2 |
| T1-06 | Browse | Dedicated shops directory | shop-web | — | Shopper can list all stores | **Gap:** home `StoreRail` only; no `/shop/stores` | P2 |
| T1-07 | Product | Open listing from rail | mobile, shop-web | Mix of live + `mock-*` | PDP shows price, images, options, Add | Expo `product/[id].tsx`; shop `product/[id]/page.tsx` + `lib/productDetail.ts` | P0 |
| T1-08 | Product | Unknown live id | shop-web | API 404, id not `mock-*` | “Not available” empty, not a crash | `findMockProduct` only for `mock-` prefix | P1 |
| T1-09 | Cart | Add to bag as guest | mobile, expo-web | — | Line persists after relaunch | `stores/cartStore.ts` (AsyncStorage) | P0 |
| T1-10 | Cart | Add to bag as guest | shop-web | — | Header badge increments | `lib/guestBag.ts` `mmall-guest-bag` | P0 |
| T1-11 | Cart | Change qty / remove line | mobile | ≥1 line | +/− and delete work; vendor groups shown | `cart/index.tsx` | P0 |
| T1-12 | Cart | Change qty / remove line | shop-web | ≥1 line | Per-line qty and remove | **Fail expected (MM-QA-017):** list + Clear only | P0 |
| T1-13 | Cart | Empty state | mobile, shop-web | Empty bag | CTA back to browse/home | Expo “Your bag is empty” → browse; shop “Continue shopping” | P2 |
| T1-14 | Checkout | Open checkout as guest | mobile | Items in cart | Address + Courier Guy + voucher/gift UI; primary CTA “Save address and sign in” | `cart/checkout.tsx` | P0 |
| T1-15 | Checkout | Open checkout as guest | shop-web | Items in bag | Same; CTA “Save address and sign in” | `shop/checkout/page.tsx` | P0 |
| T1-16 | Checkout | Empty checkout URL | mobile | Empty cart, deep link `/cart/checkout` | Should bounce to cart | **Fail expected (MM-QA-028)** | P2 |
| T1-17 | Checkout | Empty checkout URL | shop-web | Empty bag | “Your basket is empty” + continue | Guard present | P2 |
| T1-18 | Checkout | Guest place-order | mobile, shop-web | No token, address filled | Redirect to login with `next` checkout | Expo `/(auth)/login?next=/cart/checkout`; shop `/shop/login?next=/shop/checkout` | P0 |
| T1-19 | Checkout | Post-login return | mobile | `next=/cart/checkout` | Lands on checkout with bag intact | Expo Router omits `(customer)` in URL — *runtime-unverified* | P0 |
| T1-20 | Checkout | Post-login return | shop-web | `next=/shop/checkout` | `safeNext` allows `/shop/*` | `lib/finishAuth.ts` | P0 |
| T1-21 | Checkout | Mock SKU in bag | mobile | Only `mock-*` lines, signed in | Order create should not succeed against API | **Fail expected (MM-QA-006):** IDs sent, API 400 | P0 |
| T1-22 | Checkout | Mock SKU in bag | shop-web | Only `mock-*` lines, signed in | Message: demo listings cannot be charged; no PayGate | `liveItems` filter | P0 |
| T1-23 | Checkout | Live SKU + shipping quote | mobile, shop-web | API up, Johannesburg→SA city | ECO/OVN/SDD quotes; local fallback if API fails | `quoteCourierGuy` then `api.shipping.quote` | P1 |
| T1-24 | Checkout | Apply voucher / gift in UI | mobile, shop-web | Saved voucher + local card | Displayed total drops | Client math only (**MM-QA-004**) | P0 |
| T1-25 | Pay | Place order live SKU | mobile | Signed-in shopper, API, inventory | `orders.create` with `paymentReturnUrl` `mmall://` / Expo URL; mock PayGate opens | `Linking.createURL('/cart/payment-return')`; native `WebBrowser.openAuthSessionAsync` | P0 |
| T1-26 | Pay | Place order live SKU | shop-web | Same | Redirect to `order.paygate.checkoutUrl` | **No return URL passed (MM-QA-002)** | P0 |
| T1-27 | Pay | Approve mock PayGate | mobile | Mock form “Pay with Visa” | Return `TRANSACTION_STATUS=1`; cart cleared; orders list has PENDING→PROCESSING | `payment-return.tsx`; backend notify | P0 |
| T1-28 | Pay | Approve mock PayGate | shop-web | Same | Shopper confirmation on `/shop` | **Fail expected (MM-QA-002):** default `localhost:8081/cart/payment-return` | P0 |
| T1-29 | Pay | Decline / cancel | mobile | Mock decline | “Payment not completed”; bag kept (native path) | `payment-return.tsx` | P1 |
| T1-30 | Pay | Decline / cancel | shop-web | Mock decline | Bag should remain | **Fail expected (MM-QA-009):** bag cleared before redirect | P0 |
| T1-31 | Pay | Displayed vs charged amount | mobile, shop-web | Voucher or gift applied | PayGate HTML amount equals on-screen total | **Fail expected (MM-QA-004):** server `subtotal+shipping` | P0 |
| T1-32 | Pay | Zero total mall credit | mobile | Gift+voucher cover bag | Should create an order | **Fail expected (MM-QA-008):** local redeem, no API | P0 |
| T1-33 | Stock | Decline after create | api | Live product inventory N | Inventory restored or never decremented | **Fail expected (MM-QA-007)** | P1 |
| T1-34 | Options | Size/colour on PDP → order | mobile, shop-web | Product with options | Vendor order shows selected options | **Fail expected (MM-QA-021)** | P1 |

---

## Journey 2 — Auth (join / sign-in / register / vendor-login)

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T2-01 | Join hub | Open join | mobile | Guest | Shop vs sell cards; links to shopper + merchant sign-in | `app/(auth)/join.tsx` | P0 |
| T2-02 | Join hub | Open join | shop-web | Guest | Same IA | `app/shop/join/page.tsx` | P0 |
| T2-03 | Shopper register | Password + terms | mobile, shop-web | Unique email | Session CUSTOMER; land mall / `/shop` | Expo `register.tsx`; shop `signup/page.tsx`; `POST /auth/register` | P0 |
| T2-04 | Shopper login | Password | mobile, shop-web | Seed `customer@shopping-mall.local` | Session; VENDOR email rejected on shopper form | Expo `AuthProvider.login`; shop login role check | P0 |
| T2-05 | Shopper login | Prefill | mobile, shop-web, vendor, admin | Production-like build | Fields empty | **Fail expected in current code (MM-QA-026)** | P2 |
| T2-06 | Passwordless | Email OTP | mobile, shop-web | API up | Dev code shown in non-prod; verify logs in | `NativeAuthMethods` / `AuthMethods`; `POST /auth/email-otp/*` | P1 |
| T2-07 | Passwordless | Magic link | mobile, shop-web | API up | Consume via `?magic=` on login | `login.tsx` / shop login `useEffect`; `POST /auth/magic/consume` | P1 |
| T2-08 | Passwordless | Magic on cold start | mobile | Link opens app | Root linking delivers `magic` to login | *Runtime-unverified* — no dedicated consume route | P2 |
| T2-09 | Passkey | Auth / register | expo-web, shop-web | Chrome/Safari, signed-in for register | WebAuthn ceremony succeeds | `lib/passkeys.ts`; fails on native without browser — expected | P2 |
| T2-10 | OAuth | Continue with Google/Apple | all auth UIs | API up | Should hide or complete SSO | **Fail expected (MM-QA-010, MM-QA-011)** 501 | P0 |
| T2-11 | Vendor register | Phone OTP + password | mobile | Unique phone | Lands vendor desk | `app/(auth)/sell.tsx` → `registerVendor` | P0 |
| T2-12 | Vendor register | Phone OTP + password | shop-web | Unique phone | Lands `/` vendor shell | `app/shop/sell/page.tsx` | P0 |
| T2-13 | Vendor register | Duplicate desk signup | vendor | — | `/signup` same API as `/shop/sell` | Two UIs; document canonical | P3 |
| T2-14 | Vendor login | Password | vendor, vendor-mobile | Seed vendor | CUSTOMER sent to `/shop`; VENDOR to desk | `app/login/page.tsx`; Expo `vendor-login.tsx` | P0 |
| T2-15 | Role split | Shopper token on vendor desk | vendor | Customer session | Redirect `/shop` | `AuthGuard` `requiredRole="VENDOR"` | P0 |
| T2-16 | Role split | Guest on Expo desk | vendor-mobile | No token | Should redirect to vendor-login | **Fail expected (MM-QA-014)** empty desk | P1 |
| T2-17 | Session | Shop vs vendor in one browser | shop-web + vendor | Login both roles | Sessions should not clobber silently | Persist key `vendor-auth` (**MM-QA-016**) | P1 |
| T2-18 | Signed-in chrome | Header CTAs | shop-web | Customer token | Account / sign out, not Join | **Fail expected (MM-QA-016)** | P1 |
| T2-19 | Signed-in chrome | Header CTAs | mobile | Customer token | Profile tab + MallChrome welcome | Home uses `user.firstName` | P2 |
| T2-20 | Legal | Terms / privacy / vendor / fees | mobile, shop-web | Guest | Pages render static copy | Expo `(auth)/legal-*`; shop `legal/*` | P3 |
| T2-21 | Admin login | Non-admin user | admin | Customer credentials | “Admin access required” | `admin-panel/app/login/page.tsx` | P2 |
| T2-22 | Admin login | Seed admin | admin | `admin@shopping-mall.local` | Dashboard stats | *Needs API+DB* | P2 |
| T2-23 | JWT | Production secret | api | `JWT_SECRET` unset | Process should refuse to boot | **Fail expected (MM-QA-032)** fallback string | P1 |

---

## Journey 3 — Vendor sell → dashboard

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T3-01 | Entry | Sell from mall | mobile, shop-web | Guest | CourtNav Sell + footer Open a store | Expo `CourtNav` `/(auth)/sell`; shop `/shop/sell` | P0 |
| T3-02 | Register | Complete OTP | vendor, vendor-mobile | Unique phone/email | Token VENDOR; KYC banner visible | `KycBanner`; `api.kyc.me` | P0 |
| T3-03 | Overview | Metrics | vendor | Seeded sales optional | Revenue, orders, products, pending + 7-day chart | `app/page.tsx` `api.vendors.analytics` | P1 |
| T3-04 | Overview | Metrics | vendor-mobile | Token | Same four metrics; list not Recharts | `(vendor)/dashboard/index.tsx` | P1 |
| T3-05 | Products | Create listing | vendor | KYC allows create | Image upload + CRUD; table updates | `app/products/page.tsx`; `ProductForm` | P0 |
| T3-06 | Products | Create listing | vendor-mobile | Same | Form fields name/price/inventory/image URL | `dashboard/products.tsx` (URL not upload — parity) | P1 |
| T3-07 | Products | KYC blocked | vendor | New vendor, low tier | Banner + `KycActionNotice` on 403 | `assertKyc` on API | P1 |
| T3-08 | Store | Settings name/city/theme | vendor, vendor-mobile | Token | `api.vendors.update`; storefront slug works | `store/settings/page.tsx`; Expo `dashboard/settings.tsx` | P1 |
| T3-09 | Storefront | View as shopper | mobile | Vendor slug | `/(customer)/vendor/[slug]` | Desk CTA “View storefront” | P1 |
| T3-10 | Storefront | View as shopper | shop-web | Vendor slug | `/shop/store/[slug]` | No sidebar link from desk to `/shop` | P2 |
| T3-11 | Orders | List vendor orders | vendor, vendor-mobile | Paid test order | Status chips; payout amount | `app/orders/page.tsx`; Expo `dashboard/orders.tsx` | P0 |
| T3-12 | Orders | Book courier | vendor | PROCESSING order | Waybill / shipment appears | `api.vendors.orders.bookCourier` | P1 |
| T3-13 | Orders | Simulate tracking hop | vendor | Booked shipment | Copy admits mock hops | “walk the mock tracking hops” — expected demo | P2 |
| T3-14 | Fees | View schedule + payout | vendor, vendor-mobile | ENTERPRISE KYC for payout | `registerPayout` mock `PGBEN-*` | `app/fees/page.tsx`; Expo `dashboard/fees.tsx` | P2 |
| T3-15 | KYC | Submit + demo liveness | vendor | Camera optional | Wizard completes; admin can review | `app/verify/page.tsx`; admin vendors KYC | P1 |
| T3-16 | Studio | Generate + top-up | vendor, vendor-mobile | Token | Job + quota | `api.studio.*`; top-up **no PayGate (MM-QA-013)** | P1 |
| T3-17 | Ads | Create + purchase | vendor, vendor-mobile | ACTIVE_VENDOR KYC | Campaign live | `api.ads` purchase **no PayGate (MM-QA-013)** | P1 |
| T3-18 | Ads | Shopper sees campaign | shop-web | Purchased HOMEPAGE_BANNER | Live placement on `/shop` | **Fail expected:** shop `AdBand` uses `mockAds` only | P1 |
| T3-19 | Ads | Shopper sees campaign | mobile | Same | Home/browse `AdSlot` calls `api.ads.placements` | Expo home/browse; AdBand still mock | P1 |
| T3-20 | Guard | Shopper hits `/products` | vendor | Customer session | Redirect `/shop` | `AuthGuard` | P1 |
| T3-21 | Footer traps | Shopper clicks Advertise | shop-web | Guest | Should stay in sell/help | **Fail expected (MM-QA-018)** → `/login` | P2 |

---

## Journey 4 — Gift cards / vouchers

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T4-01 | List | Open gift cards | mobile, shop-web | Guest | Presets R100–R5000, custom, wallet empty | Expo `gift-cards/index.tsx`; shop `gift-cards/page.tsx` | P0 |
| T4-02 | Purchase | Tap Purchase | mobile, shop-web | Guest | Should charge PayGate then credit ledger | **Fail expected (MM-QA-005):** instant local mint | P0 |
| T4-03 | Wallet | Balance after issue | mobile, shop-web | After T4-02 | Face + last4; PIN shown once | Local store only | P1 |
| T4-04 | Share | Create claim link | mobile | Issued card | URL with `t=` token; PIN not in URL | `Linking.createURL('/gift-cards/claim')` | P1 |
| T4-05 | Share | Create claim link | shop-web | Issued card | `/shop/gift-cards/claim?t=` | `createShareToken` | P1 |
| T4-06 | Claim | Same browser | shop-web | Token unexpired | Card moves / activates in wallet | `claim/page.tsx` | P1 |
| T4-07 | Claim | Other device / Expo↔web | mobile × shop-web | Token from other surface | Should succeed against server | **Fail expected (MM-QA-015)** | P0 |
| T4-08 | Vouchers | Browse + save | mobile, shop-web | Guest | Hardcoded VELVET10, NORTH50, HARBOR15, LUMEN30, ATLAS12 | `shopVouchers` in both wallets | P1 |
| T4-09 | Checkout apply | Saved voucher | mobile, shop-web | Min spend met | Line “Voucher CODE −R…” | UI only (**MM-QA-004**) | P0 |
| T4-10 | Checkout apply | Gift code | mobile, shop-web | Valid local PIN | Apply sets credit; PayGate amount should match | **Fail expected (MM-QA-004)** | P0 |
| T4-11 | Checkout apply | Failed PIN lockout | mobile, shop-web | 5 bad tries | Wait message ~15 min | `fails` / `lockedUntil` in wallet | P3 |
| T4-12 | Help | Gift balance section | mobile, shop-web | Local cards | Shows local balance | Help screens | P2 |
| T4-13 | API | Wallet endpoints | api | — | No `/gift` or `/voucher` routes | Grep backend — confirmed absent | P0 |
| T4-14 | Admin | Gift / refund tools | admin | Admin session | Operator can void/refund mall credit | **Absent** — not a screen | P2 |

---

## Journey 5 — Mobile vs web parity (targeted)

Full feature grid: [parity-matrix.md](./parity-matrix.md).

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T5-01 | Parity | CourtNav set | mobile, shop-web | — | Home, Gift cards, Specials, Best sellers, Vouchers, CS, Sell | Both `CourtNav.tsx` files | P1 |
| T5-02 | Parity | Payment return | shop-web vs mobile | Paid order | Both confirm PayGate | **Gap MM-QA-002** | P0 |
| T5-03 | Parity | Orders tab + detail | shop-web vs mobile | Signed-in | Track shipment / PayGate status | **Gap MM-QA-012** | P0 |
| T5-04 | Parity | Profile address + passkey + logout | shop-web vs mobile | Signed-in | First-class account | Expo `profile/index.tsx`; web help snippet only | P1 |
| T5-05 | Parity | Shops directory | shop-web vs mobile | Guest | Equivalent of Shops tab | Expo `stores/index.tsx` | P2 |
| T5-06 | Parity | Bag line editing | shop-web vs mobile | Items | +/− / remove | **Gap MM-QA-017** | P0 |
| T5-07 | Parity | Mock vs live rails | both | API empty vs seeded | Same demo policy | Shop courts **always** mock; Expo merges | P1 |
| T5-08 | Parity | Notifications list | mobile vs shop-web | Signed-in | Inbox on profile | Expo `api.notifications.list`; web none | P2 |
| T5-09 | Parity | Hero banner | mobile vs shop-web | — | Strong mall open | Expo `HeroDrop` + banner image; shop FilterBar-first | P3 |
| T5-10 | Parity | Saved / Loved | both | Guest | Heart persists locally | Expo `savedStore`; shop `guestLove` | P2 |
| T5-11 | Parity | Vendor desk feature set | vendor vs vendor-mobile | Vendor token | Same capabilities, denser web forms | Both have products/orders/studio/ads/settings/fees/verify | P1 |
| T5-12 | Parity | Product image upload | vendor vs vendor-mobile | — | Upload vs URL-only | Web `lib/uploadImage.ts`; Expo image URL field | P2 |

---

## Admin (supporting — not a critical shopper journey)

| ID | Journey | Step | Surface | Preconditions | Expected | How to verify | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TA-01 | Admin | Login | admin | Seed admin | Dashboard | `app/login/page.tsx` | P2 |
| TA-02 | Admin | Approve vendor | admin | Pending vendor | Status approved; shopper can buy | `app/vendors/page.tsx` | P1 |
| TA-03 | Admin | Order status | admin | Any order | PATCH status | `app/orders/page.tsx` | P2 |
| TA-04 | Admin | Platform fees | admin | — | Settings persist JSON | `app/settings/page.tsx`; `backend/data/platform-settings.json` | P2 |
| TA-05 | Admin | Ads moderation | admin | Campaigns exist | Pause/approve | **Read-only table (MM-QA-023)** | P2 |
| TA-06 | Admin | Users roles | admin | — | Last-admin guard on API | `PATCH /admin/users/:id/role` | P3 |

---

## Suggested P0 smoke (once the stack runs)

1. T1-03 brand assets (if this fails, stop Expo testing).
2. T1-09 → T1-15 guest bag → checkout CTA.
3. T2-04 seed shopper login.
4. T1-21 / T1-22 mock SKU honesty.
5. T1-25 → T1-28 PayGate return on **both** surfaces.
6. T4-02 / T4-10 wallet vs charged total.
7. T2-10 OAuth hidden or working.
8. T3-02 → T3-05 vendor can create a product.

P0 failures already predicted by static analysis: T1-03, T1-12, T1-21, T1-26, T1-28, T1-30, T1-31, T1-32, T2-10, T4-02, T4-07, T4-10, T5-02, T5-03, T5-06.
