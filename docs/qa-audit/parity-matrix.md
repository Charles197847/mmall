# Parity matrix — Expo customer-app vs Next `/shop`

Compares the shopper experience on:

- **Mobile / Expo:** `apps/customer-app` (iOS, Android, and Expo web on port 8085 per `package.json`)
- **Web mall:** `apps/vendor-dashboard/app/shop` (Next.js, typically :3001)

Vendor **desk** parity (Next console vs Expo `(vendor)`) is a separate table at the bottom. Admin has no mobile equivalent.

Legend: **Yes** = present and wired · **Partial** = present with a gap · **No** = missing · **Demo** = UI exists but local/mock/stub.

---

## Information architecture

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Entry | `/` → `/(customer)` | `/shop` is public; `/` is vendor desk | Different hosts by design | `lib/publicPaths.ts` |
| Court nav | Home, Gift cards, Specials, Best sellers, Vouchers, Customer service, Sell | Same labels/order | **Yes** | `components/mall/CourtNav.tsx` vs `components/shop/CourtNav.tsx` |
| Primary tabs | Mall, Courts, Shops, Cart, Orders, Profile | Header: search, Loved, Basket, Join, Sign in | **Partial** | Web has no Orders/Profile/Shops tab |
| Footer columns | Mall, Sell, Orders & help, Trust | Same structure | **Partial** | Web Sell column links vendor-gated `/advertise` `/fees` `/verify` (MM-QA-018). Expo “Advertise & fees” → vendor desk (MM-QA-014). |
| Theme toggle | Yes (`themeStore`) | Yes (`ThemeToggle` in chrome) | **Yes** | |
| Deliver to | GPS + SA places + persist | Same pattern | **Yes** | Shared `searchSaPlaces` / `shopperAreaFromAddress` |
| Legal | `/(auth)/legal-shopper\|vendor\|privacy\|fees` | `/shop/legal/{shopper,vendor,privacy}` | **Partial** | Fees live under Expo legal; web fees is vendor `/fees` |

---

## Browse & catalog

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Mall home | Hero banner + BrandMark + directory + featured + courts | CourtNav + store rail + FilterBar + featured + **mock court rails** | **Partial** | Shop category rails always `mockProductsFor` (`app/shop/page.tsx`) |
| Browse / search | Courts tab + `FilterBar` | `/shop/browse` + URL-synced filters | **Yes** | Both fall back to mocks when listing empty |
| Shops directory | `stores/index` tab | Home `StoreRail` only | **No** | No `/shop/stores` |
| Product PDP | `product/[id]` mock-first then API | Live fetch; `mock-*` via `findMockProduct` | **Partial** | Non-mock API miss: shop “not available”; Expo catalog loader may still mix mocks |
| Product options / reviews | Client-seeded `withSellerDetail` | Same helper | **Yes** | Options not sent to orders (MM-QA-021) |
| Specials | `specials/index` | `/shop/specials` | **Yes** | |
| Best sellers | `bestsellers/index` | `/shop/bestsellers` | **Yes** | |
| Vendor storefront | `vendor/[slug]` | `/shop/store/[slug]` | **Yes** | |
| Saved / Loved | `saved/index` + local store | `/shop/saved` + `guestLove` | **Yes** (local) | Names differ: Saved vs Loved |
| Live ad placements | `AdSlot` → `api.ads.placements` on home/browse | Not used | **No** | Shop `AdBand` / `AdPopup` = `mockAds` |
| Mock ad bands / popup | `AdBand`, `AdPopup` from `mockAds` | Same | **Yes** (demo) | |

---

## Cart & checkout

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Persistence | Zustand + AsyncStorage | `localStorage` `mmall-guest-bag` | **Partial** | Not shared across Expo vs Next |
| Line qty + remove | Yes | No (clear all only) | **No** | MM-QA-017 |
| Multi-vendor grouping | Yes (`getItemsByVendor`) | Flat list | **Partial** | |
| Empty bag CTA | “Start shopping” → browse | “Continue shopping” → `/shop` | **Yes** | Copy differs bag/basket |
| Checkout route | `/(customer)/cart/checkout` | `/shop/checkout` | **Yes** | |
| Guest checkout UI | Yes | Yes | **Yes** | Auth at place-order |
| Address save | `api.auth.updateAddress` when token | Same | **Yes** | |
| Courier Guy quotes | Local + `api.shipping.quote` | Same | **Yes** | Collection city hardcoded Johannesburg |
| Skip API quote for all-mock bags | Yes | Yes | **Yes** | |
| Voucher + gift UI | Yes | Yes | **Yes** | Neither hits API (MM-QA-004) |
| Block PayGate for mock-only bag | **No** (sends IDs) | **Yes** (message, no charge) | **No** | MM-QA-006 |
| `paymentReturnUrl` | Passed via local `lib/api` | Not passed; client type omits field | **No** | MM-QA-002 |
| Payment-return screen | `cart/payment-return.tsx` | **Missing** | **No** | S0 for web pay loop |
| Clear bag timing | Native: after approved return. Web: gift spend before redirect | Bag cleared before PayGate | **No** | MM-QA-009 |
| Zero-total shortcut | Local redeem, no order | N/A (no equivalent branch) | **No** | MM-QA-008 |
| Mock PayGate copy | “Mock PayWeb checkout…” | Relies on PayGate HTML | **Partial** | |

---

## Auth (shopper)

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Join hub | `/(auth)/join` | `/shop/join` | **Yes** | |
| Shopper login | `/(auth)/login` | `/shop/login` | **Yes** | |
| Shopper register | `/(auth)/register` | `/shop/signup` | **Yes** | |
| Vendor sell from mall | `/(auth)/sell` | `/shop/sell` | **Yes** | |
| Merchant login from mall | `/(auth)/vendor-login` | Footer → `/login` (vendor app) | **Yes** | Different URL shape |
| Password | Yes | Yes | **Yes** | |
| Email OTP + magic | Yes | Yes | **Yes** | In-memory challenges (MM-QA-022) |
| Passkeys | Yes where WebAuthn exists | Yes | **Yes** | |
| Google / Apple buttons | Yes | Yes | **Yes** (both broken) | MM-QA-010 |
| Terms gate on register | Yes | Yes | **Yes** | |
| Signed-in header | Welcome on home; Profile tab | Always Join / Sign in | **No** | MM-QA-016 |
| Demo email prefill | Yes | Yes | **Yes** (hygiene) | MM-QA-026 |

---

## Account, orders, help

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Orders list | Tab + help section | Help `#orders` ids only | **No** | MM-QA-012 |
| Order detail | `orders/[id]` (PayGate status, shipments) | **Missing** | **No** | Unsigned detail = “not found” (MM-QA-020) |
| Profile | Address, passkey, notifications, logout | Help “Your account” name line | **No** | |
| Notifications inbox | `api.notifications.list` on profile | **No** | **No** | |
| Customer service | `help/index` section switcher | `/shop/help` in-page anchors | **Partial** | Web contact form lies that a desk will reply (MM-QA-025) |
| Returns copy | Static 7-day policy | Static; claims refunds to PayGate or gift card | **Partial** | Gift-card refund path does not exist on API |

---

## Gift cards & vouchers

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Catalog / presets | Same R amounts | Same | **Yes** | |
| Illustrated card face | `GiftCardFace` | Same component family | **Yes** | |
| Issue without payment | Yes | Yes | **Yes** (demo) | MM-QA-005 |
| Wallet list | Zustand persist | `localStorage` `mmall-wallet` | **Partial** | Isolated stores |
| Share claim link | `mmall://` / Expo URL | HTTPS `/shop/gift-cards/claim` | **Partial** | Tokens not portable (MM-QA-015) |
| Claim screen | `gift-cards/claim` | `gift-cards/claim/page.tsx` | **Yes** (same-device) | |
| Hardcoded promo vouchers | Identical `shopVouchers` | Identical | **Yes** | Not shop-specific validation |
| Apply at checkout | UI | UI | **Yes** (both fake vs PayGate) | |

---

## Vendor entry from the mall

| Feature | Expo customer-app | Next `/shop` | Parity | Notes |
| --- | --- | --- | --- | --- |
| Sell landing | Phone OTP register | Phone OTP register | **Yes** | |
| After register | Expo `(vendor)/dashboard` | Next `/` AppShell | **Partial** | Different shells; same APIs |
| Desk auth gate | Soft (queries off) | Hard `AuthGuard` | **No** | MM-QA-014 |

---

## Packages / clients

| Feature | Expo customer-app | Next `/shop` (and vendor desk) | Parity | Notes |
| --- | --- | --- | --- | --- |
| HTTP client | Duplicate `lib/api/index.ts` | `@shopping-mall/api-client` via `lib/api.ts` | **No** | MM-QA-019 |
| `shared-ui` | Declared, unused | Unused | **Yes** (neither uses it) | MM-QA-029 |
| `shared-types` | Heavy use | Heavy use | **Yes** | No GiftCard type |

---

## Vendor desk: Next console vs Expo `(vendor)`

Not the `/shop` vs Expo shopper comparison, but operators will use both.

| Feature | Next `vendor-dashboard` | Expo `(vendor)/dashboard` | Parity |
| --- | --- | --- | --- |
| Overview metrics | Recharts 7-day | Text list 7-day | **Partial** |
| Products CRUD | Table + modal + image upload | Inline form, image URL | **Partial** |
| Orders + status + courier book | `OrderList` + simulate hop | Status chips + book | **Yes** (mock tracking copy on both) |
| AI Studio | `app/studio/page.tsx` | `studio.tsx` | **Yes** |
| Advertise | `app/advertise/page.tsx` | `advertise.tsx` | **Yes** |
| Store settings | `app/store/settings/page.tsx` | `settings.tsx` | **Yes** (web form on dark shell is light-themed) |
| Pricing & fees | `app/fees/page.tsx` | `fees.tsx` | **Yes** |
| KYC verify | Full wizard + demo liveness/camera | Filename fields, no camera | **Partial** |
| Route guard | `AuthGuard` VENDOR | None | **No** |
| Link to customer storefront | Weak (no sidebar `/shop`) | “View storefront” → customer vendor slug | **Partial** |
| Duplicate signup | `/signup` and `/shop/sell` | Single `/(auth)/sell` | Web-only duplication |

---

## Highest-impact parity gaps (fix spec order)

1. Web payment-return + `paymentReturnUrl` (without this, `/shop` cannot finish pay).
2. Web orders list/detail (post-purchase).
3. Bag line editing on `/shop`.
4. Honest catalog: same mock policy on both; don’t merge unpaid demo SKUs into Buy.
5. Signed-in chrome + profile/account on `/shop`.
6. Live `api.ads.placements` on `/shop` so vendor ad spend is visible to web shoppers.
7. Single API client so checkout fields cannot drift.
