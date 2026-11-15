# Android release (EAS and Google Play)

This is the path from this repo to a Google Play closed test. It does not run a build. Payments stay the PayGate demo (`PAYGATE_MODE=mock`). Auth, the catalog, and mock-SKU behaviour are unchanged. Web and API hosting are in [DEPLOY.md](DEPLOY.md).

Do the production build only after `GET https://mmall-api.meeronixgroup.co.za/health` returns `status: ok`. Until then a preview or production binary has nowhere real to call.

## What is already set

| Item | Value |
| --- | --- |
| App directory | `apps/customer-app` |
| App name | MMall |
| User-facing version | `0.1.0` (`expo.version`) |
| Android package and iOS bundle id | `com.mmall.customer` |
| Starting `android.versionCode` | `1` |
| Starting `ios.buildNumber` | `1` |
| Deep link scheme | `mmall://` |
| Expo account owner in `app.json` | `chucky1978` |
| EAS project id | empty on purpose. `eas init` fills it. |
| Preview API | `https://mmall-api.meeronixgroup.co.za/api/v1` |
| Production API | `https://mmall-api.meeronixgroup.co.za/api/v1` |
| Development API | `http://localhost:4000/api/v1` (Metro / dev client only) |
| Demo payments flag | `EXPO_PUBLIC_DEMO_PAYMENTS=true` on every profile |

`com.mmall.customer` is the id already committed in the app and in the README. `za.co.meeronixgroup.mmall` was not applied. The package name is permanent after the first Play upload. To use the reverse-DNS id instead, change `android.package` and `ios.bundleIdentifier` together before that upload, and do not upload a build that still says `com.mmall.customer`.

## Monorepo

EAS must see the git root, where `pnpm-lock.yaml` and `pnpm-workspace.yaml` live. Do not create a second git repo inside `apps/customer-app`. Run every `eas` command from `apps/customer-app`.

`eas.json` profile `base` pins Node `20.18.3` (the repo `.nvmrc` is Node 20) and pnpm `10.15.1` (the root `packageManager` field) and turns corepack on. `development`, `preview`, and `production` extend `base`. Do not build `--profile base`. It has no artifact type and no API URL.

On the EAS builder, `eas-build-pre-install` runs `apps/customer-app/scripts/eas-slim-workspace.cjs`. That script rewrites `pnpm-workspace.yaml` to `apps/customer-app` and `packages/*`, sets `nodeLinker: hoisted`, and leaves `backend` and the other apps out so Prisma is not installed for a phone build. It only runs when `EAS_BUILD=true`.

Metro is the SDK 52 default from `expo/metro-config`. That default watches the pnpm workspace. Do not set `watchFolders` or `resolver.nodeModulesPaths` by hand. `metro.config.js` only changes directory to the app root, because Gradle starts Metro from `android/`.

Native `android/` and `ios/` folders are generated on the builder. They are gitignored. Do not commit them. A local `expo prebuild` also rewrites the `android` and `ios` npm scripts from `expo start` to `expo run`. Leave those scripts as `expo start`. EAS does not commit that rewrite.

## 1. Expo account

1. Create a free account at [https://expo.dev/signup](https://expo.dev/signup).
2. From `apps/customer-app`:

```bash
npx eas-cli login
npx eas-cli whoami
```

3. `app.json` sets `"owner": "chucky1978"`. If `whoami` prints a different username, change `owner` to that username before the first build. A mismatch fails the build.
4. Link the project. This writes `extra.eas.projectId`. Commit that change. Leave the id empty until this command prints one.

```bash
npx eas-cli init
```

`cli.appVersionSource` is `remote`. After the project exists, EAS stores `versionCode` (and the iOS build number) on that project. The `1` in `app.json` is only the starting value.

## 2. Profiles

| Profile | Android artifact | Who can install it | API URL |
| --- | --- | --- | --- |
| `development` | APK, dev client | internal (sideload) | `http://localhost:4000/api/v1` |
| `preview` | APK | internal (sideload) | `https://mmall-api.meeronixgroup.co.za/api/v1` |
| `production` | AAB (Play) | Google Play | `https://mmall-api.meeronixgroup.co.za/api/v1` |

`EXPO_PUBLIC_*` values are baked into the JavaScript bundle at build time. They are not secrets. They live in `eas.json` under each profile's `env`. A phone cannot call `localhost`. Preview and production both use the public API. The development profile is a dev client: day-to-day JS still comes from Metro and `apps/customer-app/.env`. On a physical phone, put the PC's LAN address in that `.env` (`http://192.168.x.x:4000/api/v1`). Do not put a LAN address in `eas.json`.

Production sets `android.autoIncrement` to `versionCode` and profile `autoIncrement` to `true`. On Android that is one `versionCode` bump. The same profile flag bumps the iOS build number when an iOS production build happens later. With the remote version source, the first production build bumps the local `1` and uploads `versionCode` 2. Later production builds increment from the value stored on Expo. Preview builds do not bump it.

The first time EAS builds Android it offers to generate a keystore and store it on the Expo project. Accept that. Play will reject an upload signed with a different key later. The keystore is not in git.

## 3. Preview APK

From `apps/customer-app`, after the API health check succeeds:

```bash
npx eas-cli build -p android --profile preview
```

Or from the repo root: `pnpm --filter customer-app eas:android`.

EAS prints a URL when the APK is ready. Install that file on a device (internal distribution, not Play). Confirm the shop loads from `https://mmall-api.meeronixgroup.co.za/api/v1`. This APK does not count as Play closed testing.

Checkout on the device returns through the `mmall://` scheme to `/cart/payment-return`. Expo web stays on `https://mmall-app.meeronixgroup.co.za/cart/payment-return`. Those are already the allowlisted PayGate returns. Do not change payment code or `PAYGATE_MODE`.

## 4. Google Play Console

1. Sign up at [https://play.google.com/console](https://play.google.com/console). The registration fee is **$25, once**. Complete the identity verification Google asks for. The console stays limited until that finishes.
2. Create the app. The package name must be exactly `com.mmall.customer`.
3. New **personal** Play accounts have to run a **closed test** with **12 testers** for **14 days** before production access. Internal testing does not replace that. The preview APK does not replace that.

### Store listing checklist

Finish these before `eas submit`. The console blocks review while any of them is missing.

- **Privacy policy URL.** A public `https://` page that loads without signing in. Once the shop is deployed, use `https://mmall.meeronixgroup.co.za/shop/legal/privacy`. The shorter in-app notice is also public (no login gate) at `https://mmall-app.meeronixgroup.co.za/legal-privacy` after the Expo web export is deployed. `apps/customer-app/vercel.json` rewrites that path to the single-page app.
- **Screenshots.** Capture them from the preview APK or from Expo web. The console states the sizes and counts it wants on the upload form.
- **Content rating.** Complete the questionnaire in the console. This is a shopping demo.
- **Data safety form.** Declare what the binary actually does: account data (name, email), orders and the delivery area, and foreground location only when the shopper asks for nearby shops. Payments are simulated. The app does not collect a live card number. Location is optional. There is no biometric permission.
- **Demo-payments labelling.** The short description and the full description must say that checkout is a demo and that no real charge is made. Use a line such as: "MMall is a demo. Checkout uses simulated PayGate payments. You will not be charged." The in-app line "Demo — payments are simulated" is shown on Expo web when `EXPO_PUBLIC_DEMO_PAYMENTS=true`. The Android binary does not show that banner. The store listing is what labels the demo on Play. Do not switch the API out of mock PayGate to make the listing sound live.

The privacy notices in the repo tell people to email `privacy@mmall.local`. That mailbox is not a public address. Replace it with a mailbox Meeronix actually reads before the listing is submitted. This repo does not invent that address.

## 5. Production AAB

From `apps/customer-app`:

```bash
npx eas-cli build -p android --profile production
```

The artifact is an `.aab`, which is what Play accepts. `distribution` is `store`.

## 6. Submit to closed testing

Create a Play Console API access service account that can release to the testing track. Download its JSON key and keep it outside the repo. Do not commit it.

`eas.json` `submit.production.android.track` is `alpha`. That is Play's closed testing track. Submit does not go to production with this file as it stands.

```bash
npx eas-cli submit -p android --profile production --latest
```

Point the prompt at the service account JSON when it asks. Complete the listing checklist first or Play rejects the release.

Invite at least 12 testers on that closed test and leave them opted in for 14 days. After that requirement is met, apply for production access in Play Console. Only then change `submit.production.android.track` from `alpha` to `production` and submit again.

## Icons and splash

These files are real brand marks (navy field, neon bag, white M), not placeholders:

| File | Size | Role |
| --- | --- | --- |
| `assets/icon.png` | 1024×1024, opaque | Store icon |
| `assets/adaptive-icon.png` | 1024×1024, opaque, artwork inside the center 66% | Android adaptive foreground |
| `assets/splash.png` | 1284×1284, opaque | Splash, `resizeMode: contain` |
| `assets/favicon.png` | 196×196 | Expo web only |

Adaptive-icon background and the splash background are `#0B1736`, the same navy as the image corners, so the splash letterbox matches the mark.

## Permissions

The Android manifest requests internet plus coarse and fine location. Location is used only when a shopper asks for nearby shops (`expo-location`, foreground). `USE_BIOMETRIC` and `USE_FINGERPRINT` are not requested. Passkeys in this app run in the browser (`PublicKeyCredential`), not through an Android biometric prompt.

The Expo template also adds storage, vibrate, and draw-over-other-apps. Those are blocked in `android.blockedPermissions`. Nothing in the app reads the photo library, vibrates, or draws over other apps. The in-app dev menu does not need the overlay permission.

`usesCleartextTraffic` stays on so a development build can call `http://localhost`. Preview and production talk to the HTTPS API. iOS still allows arbitrary HTTP loads for the same local-dev reason. That is not a Play setting.

## What this does not do

- No `eas build` and no `eas submit` from this change. There is no Expo session on the machine that prepared the config.
- No live PayGate. The API refuses to boot in production unless `PAYGATE_MODE` is `mock` or `sandbox`.
- No change to auth, catalog, or mock listings.
- No second application id. iOS keeps `com.mmall.customer` so a later iOS build matches Android.
