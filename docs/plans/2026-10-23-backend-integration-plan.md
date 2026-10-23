# Backend integration plan: login, booking, payment (Angular side)

- **Status:** rev 3, 2026-10-23. Slices are built one at a time; after each: build/test green, tick it here, commit. Progress: navbar UI done (FE-2b, see below); FE-0 done; FE-1 on standby (live check passed, awaiting your confirmation); All slices FE-0 to FE-8 built (FE-0 to FE-6 verified by the owner; FE-7 and FE-8 are code, tests and axe, with App Check switched off until a key exists); what remains is the owner's walk through the guide's local test script (table under FE-8), the Privacy wording review, and a design refinement pass.
- **Source:** `../ease-disease-backend/docs/frontend-tasks/2026-10-22-frontend-integration-guide.md` (how-to), `../ease-disease-backend/api-flow.md` (locked contract), Swagger at `localhost:3000/docs` (wins on any disagreement).
- **Created:** 2026-10-23

### Changes in rev 2
- Details form uses **Signal Forms** (was Reactive Forms).
- **No confirm-and-pay screen**: Submit creates the booking, then goes straight to PayU. The dialog is two steps, not three.
- **Navbar redesign** added (section 3.2 and slice FE-2b), including the phone layout.
- Notes field dropped. Privacy page wording will be drafted by me (FE-7). Firebase config starts as placeholders.

### Navbar as built (replaces the sketches in 3.2)
Decisions made while reviewing it in the browser; where they differ from 3.2 below, this wins.
- Full-width white bar (90% opacity, blur), flush to the top edge, fixed on every screen size. No floating card, no radius.
- Brand is the full wordmark (logo, name, "Functional Medicine", rule); it does not shrink on scroll. Below 375px it is the logo alone.
- Laptop (900px+): brand left, links centred, Log in / Sign up and **Book now** right. Links and Log in / Sign up carry a thin underline.
- Below 900px: brand, Book now, and a two-line menu button. The menu is a white sheet dropping from the top edge (Esc, X, or a tap outside closes it).
- Links hide the page you are on and put Home first elsewhere (Events page: Home, Experts; Privacy: Home, Events, Experts; Home: Events, Experts). Experts always stays. My bookings appears only when signed in (its route arrives in FE-6).
- The CTA is the short **Book now**. The scroll-revealed price pill and its cycling label are gone from the chrome (the `BookingCtaService` is no longer read by the shell and can be cleaned up later).
- Log in / Sign up opens the sign-in dialog; the account state is real (`AuthService`, FE-2). The dev-only `?as=user` preview that existed earlier has been removed.

---

## 1. What I checked in the code (the guide's claims hold)

| Claim in the guide | Verified |
|---|---|
| Routes: `''`, `events`, `privacy`, `founders/*`, wildcard | Yes (`app.routes.ts`). No `auth/finish`, `booking/:reference`, `my-bookings`. |
| No HTTP client, Firebase, environments, interceptors, proxy | Yes. `app.config.ts` has router + service worker only; `package.json` has no `firebase`; no `src/environments/`; `angular.json` serve has no `proxyConfig`. |
| Booking UI is a demo | Yes. `booking-form.ts` (584 lines, inline template + styles): `submit()` sends nothing, `continueToPayment()` shows a note. Opened by `BookingModalService.open()`; mounted once in `app.html`. |
| Price hard-coded | Yes. `core/config/booking.ts` `MAIN_PLAN` plus `₹5,000 ₹2,499` literal in the form's thank-you. Header comment there still says Razorpay/Web3Forms; the backend uses **PayU**, so that comment is stale. |
| Backend `GET /v1/packages` not built | Confirmed: no packages module in `ease-disease-backend/src`. FE-1 starts on the seed-id fallback. |
| Form fields | `name, phone, email, age, city, gender, consent`. Age validator allows 120 (API max 119). Phone accepts any 10 digits (API needs `+` and country code). |

Chrome today (what the navbar redesign starts from):
- `app-wordmark` fixed top-left, with a `minimized` mode on scroll (text hides, logo stays). `app-cta-pill` fixed top-right: on desktop it unfurls only after the hero (scroll-driven opacity from `BookingCtaService`, set in `home.ts`); at `max-width: 640px` it is always visible, translucent glass. `app-scroll-progress` is a rail on the right edge (steps aside while the conditions tree is on screen below 900px).
- There is **no nav links row** today. `shared/components/menu-dot` is an unused earlier hamburger: a 44px glass dot that opens a full-screen deep-surface overlay with large display-font links. It only has Events / Community / Log in as stub `#` hrefs. It is the natural base for the phone menu.
- Section ids on Home that links can target: `#experts`, `#community`, `#programme`, `#results`, `#top`. `FragmentScrollService` already handles `/#fragment` navigation from other pages.
- The dialog is a centred card on desktop and a full-screen sheet at `max-width: 640px`, with safe-area inset handled. We extend that pattern.
- Hosted on Vercel (`vercel.json`) with an Angular service worker (`ngsw-config.json`): both matter for new deep-link routes and API calls (FE-0 checks).

## 2. Decisions

1. **Plain `firebase` modular SDK, lazy-loaded** (dynamic `import()` inside `AuthService`) so the Home page's first load does not grow. (Agreed.)
2. **Split the booking dialog.** `booking-form.ts` stays the dialog shell (open/close/focus) and gains child components: `sign-in-step` and `details-step`. One responsibility each. Existing styles and `bk-*` class names are reused, not redesigned. The shell takes a mode: `book` (sign-in if needed, then details, then pay) or `sign-in` (sign-in only, used by the navbar's Log in / Sign up).
3. **Signal Forms (`@angular/forms/signals`)** for the details step and any other new form. The existing form is rewritten onto them in FE-3b with a schema for the guide's field rules (name 2-100, `+` phone, email max 50, age 1-119 as a number, city 2-100, gender optional, consent exactly `true`). Server `details.fields` errors are written back onto the matching fields (`whatsappNumber` maps to the `phone` field). Visual design and `bk-*` styling do not change. I will confirm the Signal Forms API against the installed `@angular/forms` version before coding, since it is new.
4. **No NgRx.** Signals in `@Service()` classes: `AuthService`, `PackagesService`, `BookingsService`, `PaymentService`.
5. **Error handling is code-based** (`ApiError.code`) with one shared message map `core/api/error-messages.ts`, so wording is identical across the dialog, status page and My Bookings.
6. **Dev proxy, not CORS**, locally. Staging/prod need the backend CORS task.
7. **Draft persistence** for the email-link round trip: `sessionStorage` only, cleared on submit/sign-out, never logged.
8. **Firebase config = placeholders for now** in `environment.ts` (`apiKey`, `authDomain`, `projectId`, `appId` and `useAuthEmulator`). You swap in your developer project's values later; nothing else changes. Until then real Google/email sign-in cannot work; the Auth emulator route (needs only a matching `projectId` with the backend's `FIREBASE_PROJECT_ID`) lets us build and test everything meanwhile.

## 3. Design (fits the backend flow, existing language only)

Language: ivory / oxblood / ember / honey, organic curves, glass surfaces, muted palette, hero underline treatment, display font for big links. No new colours; new tokens only if a state (error, success) is missing from `src/styles/tokens/colors.css`.

**Breakpoints** (as the app already uses): phone `<= 640px`, tablet `641-1024px`, desktop `> 1024px`. Test at 320, 375, 414, 768, 1024, 1440, plus landscape phone. Rules: no horizontal scroll, 44px minimum tap targets, `100dvh` not `100vh` for sheets, safe-area insets, reflow at 200% zoom, visible focus rings, AA contrast, reduced-motion respected. Per your standing rule, mobile-only changes go inside the matching media query and leave desktop untouched (and vice versa).

### 3.1 Booking dialog: two steps, then PayU

```
 desktop / tablet: centred card              phone: full-screen sheet
 +--------------------------------+          +--------------------------+
 | x                              |          | x                        |
 | E.A.S.E. Root Cause · 30 min   |          | E.A.S.E. · 30 min        |
 | Step title                     |          | Step title               |
 |--------------------------------|          |--------------------------|
 | STEP 1  Sign in (if signed out)|          | same content, 1 column,  |
 |  [ Continue with Google ]      |          | sticky footer, full-width|
 |  ---------- or ----------      |          | primary button           |
 |  email [__________] [Send link]|          |                          |
 |                                |          |                          |
 | STEP 2  Your details           |          |                          |
 |  name  | whatsapp (+91 pre-fill)|         |                          |
 |  email | age                   |          |                          |
 |  city  | gender chips          |          |                          |
 |  [ ] consent  [Pay Rs 2,499]   |          |                          |
 +--------------------------------+          +--------------------------+
        |
        v  (Submit) booking created -> checkout -> dialog shows
           "Taking you to payment..." (spinner, aria-live) -> browser leaves for PayU
```

- The Submit button states the price: **"Pay ₹2,499"** (from the package, never typed by hand), so the person knows what pressing it does without a separate confirm screen.
- Signed in already: the dialog opens straight on details. No stepper chrome; a quiet "Step 2 of 2" for screen readers only.
- **Edge case that now matters:** the booking is created before the redirect. If the checkout call fails after the booking exists (gateway down, network), the dialog shows the error with a **Try payment again** button that reuses the same booking reference (no second booking), plus "You can also pay later from My bookings". The booking stays `PENDING_PAYMENT` and appears there.
- Focus: each step moves focus to its heading/first field; `aria-live="polite"` for step changes, errors and the "Taking you to payment" state; field errors tied with `aria-describedby`; first invalid field focused after a `VALIDATION_FAILED`.
- Phone field: pre-filled `+91 `, helper "Include your country code". A pasted 10-digit Indian number gets `+91` prepended before sending, per the guide.
- Idempotency: key created on Submit, kept for identical retries, renewed on any field edit (per guide); a separate key for the checkout call.

### 3.2 Navbar redesign

**Restating the brief so we agree before I touch anything.** "Atleast when the hero section is shown" I read as: while the hero is on screen the top bar is a full navbar with links; once the reader scrolls past the hero it falls back to today's compact chrome (wordmark + CTA pill), because a full link row over the scrollytelling sections would compete with the story. On non-home pages (Events, Privacy, Founders, booking status, My bookings) there is no hero, so the full navbar stays. If you want the full navbar always visible, say so; the plan changes only in the "after hero" rows below.

Links: **Events**, **Experts**, **My bookings** (signed-in only), **Log in / Sign up** (signed-out only; one button, because Google and email-link sign-in create the account the first time), and the **Book a consultation** button.

```
DESKTOP / TABLET (> 640px), in the hero, signed out
 [logo] Ease Dis-ease        Events   Experts      Log in / Sign up   [ Book a consultation ]

 in the hero, signed in
 [logo] Ease Dis-ease        Events   Experts   My bookings    (P v)   [ Book a consultation ]
                                                               avatar menu: Account email, My bookings, Sign out

 after the hero (home only): back to today's chrome - nothing duplicated
 [logo] Ease Dis-ease                                         [ pill: Book now · 30 min · Rs 2,499 ]
        links fold into a small menu dot next to the pill (same overlay as phone)
```

- The nav "Book a consultation" button and the scroll-revealed pill are the **same CTA at two stages**: the nav button hands over to the pill as the hero leaves (crossfade driven by the existing `BookingCtaService.opacity`), so there is never a second CTA on screen.
- Tablet (641-1024px): link row tightens (smaller gaps, `Log in / Sign up` becomes `Log in`); below roughly 820px the links fold into the menu dot like phone, because logo + three links + CTA does not fit. Exact fold point is decided by measuring in FE-2b, not guessed.
- Desktop gutters keep the existing `.chrome-wordmark` / `.chrome-cta` alignment to `.scene-inner` (the 1200px container rule in `app.scss`).

```
PHONE (<= 640px)  - option A (recommended)
 in the hero:   [logo]  [ Book a consultation ]  (:)         (:) = menu dot (3 oxblood dots, glass, 44px)
 scrolled:      [logo]  [ Book your slot ]       (:)         pill keeps cycling its label as today

 menu dot opens a full-screen deep overlay (reuse menu-dot visuals):
 +----------------------------+
 |                         x  |
 |                            |
 |        Events              |   display-font links, ivory on deep surface, honey on hover/focus
 |        Experts             |
 |        My bookings         |   signed in only
 |        Log in / Sign up    |   or "Sign out" + account email when signed in
 |                            |
 |   [ Book a consultation ]  |   primary button at the bottom (thumb reach)
 +----------------------------+
```

- Why A: the CTA pill is already always visible on phones and carries the cycling label; keeping it avoids a regression. At 320px the row is logo mark (wordmark minimized, ~40px) + pill + 44px dot, which fits; the full "Ease Dis-ease" text would not, so on phones the wordmark shows its logo only in the top bar (text still in the footer and menu overlay).
- Option B (not recommended): move Book into the overlay only and drop the always-visible phone pill. Cleaner top bar, but fewer bookings from a persistent CTA.
- Overlay a11y: `role="dialog"` + `aria-modal`, focus trap, Escape closes, focus returns to the dot, `aria-expanded` on the trigger, body scroll locked, closes on link tap and on route change. Fix the current stub: links become real routes (`/events`, `/#experts` via `FragmentScrollService`).
- Auth-aware states come from `AuthService.ready/user`; until `ready` is true show neither Log in nor the avatar (no flicker of the wrong state).
- Scroll rail (right edge) is unchanged.
- The `app-account-menu` (avatar dropdown) is its own small component: keyboard operable, Escape closes, focus returns to the trigger.

### 3.3 Booking status page `/booking/:reference`

```
 +--------------------------------------+
 |  (icon)  Confirming your payment...  |   states: confirming / confirmed / still-confirming /
 |  ED-7K3QXM    Rs 2,499               |            failed / needs-attention / not-found
 |  [ spinner, aria-live ]              |   one centred card on every breakpoint;
 |  notice: "?e=" banner when present   |   max-width ~560px, side gutters 16px on phone
 |  [ Book again ]  [ My bookings ]     |   buttons stack full width on phone
 +--------------------------------------+
```

### 3.4 My Bookings `/my-bookings`

```
 desktop / tablet: rows in a list card         phone: stacked cards
 Active | Past   (tabs)                         Active | Past
 ED-7K3QXM  One-Time Consult  22 Oct  Rs 2,499  +------------------------+
            Awaiting payment      [Pay now]     | ED-7K3QXM   Awaiting   |
 ...                                            | One-Time Consult       |
 [ Load more ]                                  | 22 Oct, Rs 2,499       |
                                                | [ Pay now ]            |
 Empty: "No bookings yet" + Book now           +------------------------+
```

Tabs use `tablist` semantics; each row is one link target, Pay now a separate button inside it. Dates in IST.

## 4. Slices

Each slice: build (`npx ng build` or `npx tsc --noEmit -p tsconfig.app.json`) + Vitest green, responsive check at the widths in section 3, tick the box, update this doc, commit.

- [x] **FE-0 Plumbing (no visible change). DONE 2026-10-23.** `environments/*` (Firebase **placeholders**, `useAuthEmulator`) + `fileReplacements`; `provideHttpClient(withInterceptors)`; `core/api/{api-types,api-error,api-client}.ts`; error-mapping interceptor (reads `Retry-After`, `X-Request-Id`); `proxy.conf.json` wired into `angular.json` serve; install `firebase`; check `ngsw-config.json` does not cache `/v1/**` and `vercel.json` rewrites deep links (`/booking/*`, `/my-bookings`, `/auth/finish`) to the app. Unit tests for the error mapper (404, 400 fields, 429, status 0 to NETWORK). *Done when:* `GET /healthz` via the proxy works and a 404 surfaces as `ApiError` with `requestId`.
  - *Built:* `firebase` ^13.1.0 installed (not imported yet, so no bundle change); `src/environments/` (model + dev/staging/production, Firebase values are `PLACEHOLDER-*` with a `demo-ease-disease` project id for the Auth emulator, `launchPackageId` = the seed id); `fileReplacements` for the production build and a new `staging` build configuration; `provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor]))`; `core/api/{api-types,api-error,api-error.interceptor,api-client}.ts`; `proxy.conf.json` (`/v1` and `/healthz` to localhost:3000) wired into `serve`.
  - *Checked:* 13 new Vitest tests pass (error mapper: body, NETWORK, field errors, Retry-After, header request id, non-API body; client + interceptor: 404 to `ApiError` with `requestId`, network failure, Idempotency-Key header and uuid v4). dev, staging and production builds pass. Against the live backend through the dev proxy: `/healthz` answers ok and a token-less `/v1/me` returns the standard error envelope the parser reads.
  - *Environment `fileReplacements`:* proven in FE-1 (each bundle contains only its own API URL).
  - *Service worker / Vercel:* no change needed. `ngsw-config.json` has only an asset group, so `/v1/**` is never cached, and `vercel.json` already rewrites every path to `index.html`, which covers `/booking/*`, `/my-bookings` and `/auth/finish`.
  - *Known, not caused by this slice:* `src/app/app.spec.ts` fails at HEAD (jsdom has no `matchMedia`, and `SwUpdate` has no provider in the test). Left alone; needs its own small fix.
- [x] **FE-1 Package from the API. DONE; the live check passed on 2026-10-24 (see the last evidence line below); the owner had put it on standby, so please confirm.** The backend session is implementing `GET /v1/packages` (2026-10-23). Open check, to run when it lands: change the package price in the database, refresh, and confirm the CTAs, Level card and dialog follow it; also confirm the real response matches `PackageItem` (fields `id, title, description[], pricePaise, currency, durationMinutes`) and that the original price is still a frontend constant. Until then the fallback copy must equal the seed package (30 min, ₹2,499).
  - *Live evidence (2026-10-23, backend session shipped the endpoint):* `GET /v1/packages` answers 200 with `Cache-Control: public, max-age=300` and exactly `id, title, description[], pricePaise, currency, durationMinutes`; Home's hero CTA now shows the database price. The local DB row currently has `pricePaise: 100` (so Home shows ₹1 beside the struck-through ₹5000): a test price, to be reset before anything is shown to real visitors. Still on standby until you confirm the slice. `PackagesService` with `mainPackage` signal. Until the backend ships `GET /v1/packages`: seed id in the environment file and existing `MAIN_PLAN` text. Replace price/duration consumers (`app.html` CTA pill, `booking-cta`, dialog) with the service; keep `₹5000` as a constant. Fix the stale Razorpay/Web3Forms comment in `booking.ts`. *Done when:* changing the DB price changes the page after refresh (or, in fallback mode, the id is wired and nothing visibly changes). **Real endpoint blocked on the backend.**
  - *Built:* `core/services/packages.ts` (`PackagesService`: `mainPackage`, `plan`, `packageId`, `durationWords`; loads `GET /v1/packages` once at start-up from `App`; any failure keeps the fallback silently). `core/config/booking.ts` is now the typed fallback copy (`Plan`, `MAIN_PLAN`) with the stale Razorpay/Web3Forms comment fixed. Home's hero and close CTAs, the Level 1 card (price, original price, duration note) and the booking dialog's header and thank-you price read the service. `BookingCtaService.plan` removed (nothing read it after the navbar change).
  - *Checked:* 7 new tests (fallback before load, API price/duration after load, original price stays the marketing constant, 404 and empty list keep fallback, one request only, rupee formatting). In the browser, Home still shows `30 min · ₹2499 / ₹5000` and the app's request for `/v1/packages` gets the backend's 404 with no console errors. The staging and production bundles each contain only their own API URL, which proves the environment `fileReplacements` (closing the FE-0 gap).
  - *Still to do when the backend ships the endpoint:* the "change the DB price, refresh, page changes" check. Until then a wrong fallback price could differ from what the server charges, so keep `MAIN_PLAN` equal to the seed package (30 min, ₹2,499).
  - *Left for FE-3b:* the demo thank-you screen's literal "(30 minutes)" and demo-mode notes, which are deleted when that screen is replaced. Prices there now use the service but lose the thousands comma ("₹2499", matching Home).
  - *Update 2026-10-24, live check passed:* the backend now serves `GET /v1/packages` (its commit `8e4bbe7`) with an extra optional `originalPricePaise`. Over two checks the database price went from 100 paise to 249900 paise and Home followed it each time (`₹1` then `₹2499`), and the response matches `PackageItem`. The struck-through "was" price now comes from the API too (`originalPricePaise: 500000` renders `₹5000`); once a package has loaded, no `originalPricePaise` means nothing is struck through, while the fallback copy (before load, or if the API is unreachable) still shows `₹5000`. 1 new test (no "was" price) plus the adjusted one; 167 tests pass.
- [x] **FE-2 Sign in (service layer). DONE. Google sign-in verified by the owner (2026-10-23): avatar shows, `users` row created, and a second sign-in updated `last_login_at` on the same row. Email-link sign-in end to end still to be tried by a person.** Lazy `firebase` init (with optional `connectAuthEmulator`); `AuthService` (`user`, `profile`, `ready`, `busy`; Google popup, email link, finish, sign out, `/auth/sync` then `/me`); auth interceptor (Bearer token, one refresh-and-retry on 401, then sign out); `auth/finish` lazy route (page itself responsive: centred card with a status line and a "type your email again" form on a different device). Handle `EMAIL_NOT_VERIFIED`, `UNSUPPORTED_SIGN_IN_PROVIDER`, `AUTH_UNAVAILABLE` (keep session) per the guide. *Done when* (emulator is fine): sign-in with both methods creates the `users` row, refresh keeps the session, sign out works. Watch the email-link provider "known unknown".
  - *Built:* `core/auth/firebase-auth-client.ts` (the only file touching the SDK, loaded by dynamic `import()` so Firebase is a separate lazy chunk; optional Auth emulator); `core/services/auth.ts` (`AuthService`: `profile`, `user`, `ready`, `busy`, `error`, `needsRetry`, Google pop-up, email link send/finish with the email kept in `localStorage` and a "type it again" path, `signOut`, `retry`, `GET /v1/me` on page load and `POST /v1/auth/sync` after a sign-in, never both); `core/auth/auth.interceptor.ts` (Bearer token on API calls except `/healthz` and `/v1/packages`; one fresh-token retry on a 401, then sign out); `core/api/error-messages.ts` (`describeError`: one plain sentence per API code and Firebase code, silent when the person closes the Google window, request id on generic failures); `features/auth-finish` at `/auth/finish` (Signal Forms email field, `next` only followed when it is an internal path). Local `projectId` set to `ease-disease-vivek` to match the backend `.env`.
  - *Failure rules as built:* `UNAUTHENTICATED`, `EMAIL_NOT_VERIFIED`, `UNSUPPORTED_SIGN_IN_PROVIDER` sign the person out with a sentence; `AUTH_UNAVAILABLE`, `APP_CHECK_UNAVAILABLE`, `NETWORK`, `RATE_LIMITED` keep the Firebase session and set `needsRetry` (nothing shows a Retry button yet: FE-3a / FE-7).
  - *Checked:* 25 new tests (AuthService flows, interceptor, messages) all pass; production build passes (initial bundle 398.7 to 407.4 kB; Firebase and the auth page are lazy chunks). In the browser: Firebase loads lazily and the navbar settles on Log in / Sign up with no console errors; `/auth/finish` shows "This link does not look right" without a link and "Confirm your email" for an email-link-shaped URL; layout holds at 1440, 390 and 320.
  - *To verify for real (needs the Firebase web config pasted into `src/environments/environment.ts`, `useAuthEmulator: false`, plus FE-3a's button):* Google sign-in and email-link sign-in each create the `users` row; refresh keeps the session; sign-out works; check whether an email-link login is accepted (the guide's "provider" known unknown).
  - *Known:* the dev-only `?as=user` preview stays until the real flow is verified. Before sign-in state is known (a moment after load) the navbar shows neither Log in nor the avatar, as designed.
- [~] **FE-2b Navbar redesign. UI DONE (committed); auth-driven behaviour waits for FE-2 and FE-3a.** Section 3.2: nav links row, Book button, auth-aware Log in / Sign up and avatar menu, menu dot + overlay on phone (reworked from `menu-dot`), hero-to-pill handover, non-home pages keep the full bar. Log in / Sign up opens the dialog in `sign-in` mode (needs FE-3a's sign-in step; if FE-3a is not done yet, FE-2b builds the sign-in step first as a small shared component). "My bookings" link is added with FE-6 so it never points at a missing route. *Done when:* every state in 3.2 works at 320, 375, 414, 768, 1024, 1440, keyboard-only, with no layout shift when auth resolves.
- [x] **FE-3a Dialog restructure + sign-in step. DONE 2026-10-23. Google path verified by the owner; the emailed-link round trip (and the dialog reopening on the form afterwards) still to be tried.** Extract step components; signed-out `book` mode opens on sign-in; draft saved to `sessionStorage` for the email-link leg and restored on return. No booking API call yet. *Done when:* a signed-in user sees the same form as today and the signed-out path works at all breakpoints.
  - *Deviation from the plan, on purpose:* the existing details form was NOT extracted into its own component, because FE-3b rewrites it onto Signal Forms anyway; extracting Reactive-Forms code now would be thrown away. The shell (`booking-form.ts`) keeps it for now and FE-3b moves and rewrites it in one step. Also, sign-in comes BEFORE the details, so there is no typed draft to save for the email-link trip; what is saved instead is the *intent* (`sessionStorage` `ed-book-intent`), and `/auth/finish` reopens the dialog on the details step when the person was booking.
  - *Built:* `BookingModalService` gains `mode` (`book` | `sign-in`) and the intent helpers; `AuthService.openSignIn()` now opens the dialog in `sign-in` mode (the navbar's Log in / Sign up works, in the laptop bar and the phone menu); new `sign-in-step.ts` (Continue with Google; or an email field on Signal Forms with "Email me a sign-in link"; "Check your inbox" state with Send again / Use a different email; error and retry notices; copy that says one step covers log in and sign up, no password, with a Privacy Policy link); the shell shows `checking` (session unknown), `sign-in`, or the details form, moves on by itself when sign-in finishes, closes itself after a navbar log-in, and moves focus into the new view.
  - *Checked:* 13 new tests (modal service modes and intent; sign-in step copy, Google click, busy state, email validation, link sent, no booking intent for a plain log-in, failure stays on the form, retry); production build passes. In the browser at 1440 and 390: the Log in dialog, the Book now dialog (title "Sign in to book") and the signed-in preview (`?as=user`, the same booking form as before) all render correctly with no horizontal overflow. Against the real Firebase project: the email-link request is accepted (HTTP 200 from `sendOobCode`), which shows the Email link method is enabled and `localhost` is an authorized domain.
  - *Bundle:* the dialog sits in the app shell, so the step is loaded with `@defer` (its own 8.5 kB chunk); otherwise Signal Forms would have added about 48 kB to the first load. Initial total is 416.9 kB (was 407.4 kB before this slice). The step focuses its own Google button when it arrives.
  - *Not yet clicked through by a person:* Google pop-up sign-in, opening the emailed link and landing back on the details step, sign-out, and the `users` row appearing in the database. Steps for you are in the session notes: sign in with Google from Log in / Sign up, confirm the avatar appears and a row exists in `users`; then Book now while signed out, use the email link, and confirm the dialog reopens on the form.
- [x] **FE-3b Details step on Signal Forms, talking to the API. DONE and verified by the owner (2026-10-24): two real bookings created as `PENDING_PAYMENT` with the typed details, an invalid number rejected, and a 15-digit international number accepted.** Rewrite onto Signal Forms (decision 3); field mapping and rules per the guide; `POST /v1/bookings` with `Idempotency-Key`; Submit disabled in flight; all FE-3 error codes mapped; server field errors shown under the right control. Submit button reads "Pay ₹2,499". *Done when:* a `PENDING_PAYMENT` row exists with the typed details and every error shows a clear message.
  - *Built:* `details-step.ts` (the booking form moved out of the shell and rewritten on Signal Forms; same look, plus a "Include your country code" hint and per-field messages; phone starts as `+91 `; the Pay button shows `Pay ₹<price>` from the package); `core/booking/booking-rules.ts` (the API's rules mirrored: name and city 2-100, `+` phone 8-15 digits with a bare 10-digit Indian mobile getting `+91`, PayU email pattern up to 50 characters, age 1-119 as a number, optional gender omitted when empty; request builder that never carries a price or notes); `core/booking/attempt-key.ts` (same request keeps its `Idempotency-Key`, any edit makes a new one); `core/services/bookings.ts` (`POST /v1/bookings`); `PackagesService.reload()`. Errors: field complaints from `VALIDATION_FAILED` go under the right control (`whatsappNumber` under the phone field), `IDEMPOTENCY_CONFLICT` retries once with a new key, `RATE_LIMITED` shows the wait and disables Pay with a countdown, package off sale shows the message and reloads the package, everything else uses the shared `describeError`. The shell (`booking-form.ts`) is now only the frame plus four views (checking, sign-in, details, created) and no longer imports Reactive Forms.
  - *Interim screen:* after a 201 the dialog shows "Booking created" with the reference, package, name and amount, and says the payment step comes next. FE-4 replaces this with the hand-over to PayU. The Pay button creates the booking only, until FE-4 lands.
  - *Not done here on purpose:* the `TOO_MANY_PENDING_BOOKINGS` message has no "My bookings" link yet (the page arrives in FE-6); `notes` is not offered (owner decision).
  - *Checked:* 31 new tests (rules, attempt key, bookings call, and the step: empty submit shows every missing field and sends nothing, exact request body, gender and bare-number handling, server field error under the phone field, same key on an identical retry, new key after an edit, conflict retry, rate-limit countdown, package-off-sale reload, daily limit). In the browser at 1440 and 390: validation messages, focus lands on the first problem, radio group named automatically, no overflow; a real `POST /v1/bookings` without a login token comes back 401 and the form shows "Your session ended. Please sign in again." with the button restored. Production build: initial bundle is 366 kB (it was 417 kB: removing Reactive Forms from the always-loaded shell more than paid for the new code); details step is a 14.5 kB lazy chunk.
  - *Lesson recorded:* inputs with `[formField]` must not carry `required`, `min`, `max`, `maxlength` or `name` attributes (compile error NG8022); the schema validators own those, and radios are named automatically.
  - *To verify by hand (signed in with Google):* Book now, fill the form, Pay: a row appears in `bookings` with status `PENDING_PAYMENT` and the typed details (which may differ from the account's name and email), and the dialog shows the reference. Then press Book now again with identical details to see a second booking, and check a bad phone number or an under-age value for the messages.
- [x] **FE-4 Pay (immediately after create). DONE and verified by the owner (2026-10-24): card and UPI payments each completed for two different bookings; both rows are `CONFIRMED` with `confirmed_at` set.** `PaymentService.startPayment(reference)`: checkout call, hidden form POST to `gatewayUrl` with `fields` untouched and unstored; "Taking you to payment..." state; one shared flow for Submit and for My Bookings' Pay now; the retry-payment-on-same-booking behaviour from 3.1; error map (`BOOKING_NOT_PAYABLE` to status page, `PAYMENT_PHONE_UNSUPPORTED`, `PAYMENT_GATEWAY_UNAVAILABLE`, etc.). *Done when:* Submit lands on PayU's test page with the right amount. Needs the backend running with PayU test credentials loaded.
  - *Built:* `core/services/payment.ts` (`PaymentService.startPayment(reference)`: `POST /v1/bookings/{ref}/checkout` with no body and an `Idempotency-Key`, then `handOver()` builds a hidden POST form with one hidden input per field exactly as given and in order, appends it and submits it; refuses anything that is not an https POST; nothing is stored or logged; the same booking keeps its key across retries because the API stores only successful answers, and one fresh key is tried on `IDEMPOTENCY_CONFLICT`); `pay-step.ts` (the dialog's last view: "Taking you to payment..." with a spinner while the browser leaves; if checkout fails the booking stays saved and the screen says why and offers "Try payment again" on the SAME booking; no retry button when it cannot help, i.e. `BOOKING_NOT_PAYABLE` or `PAYMENT_PHONE_UNSUPPORTED`; rate limits show a countdown; a Back from PayU that restores the page shows "Payment not completed" with a Pay button). The dialog now goes from the details step straight to this step, and the interim "Booking created" screen is gone.
  - *Checked:* 12 new tests (checkout call shape; the posted form field by field; refusing non-https, javascript: and non-POST forms; key reuse after a failure, a new key for another booking, one retry on a key conflict; the step's starting, failed, no-retry, rate-limit and Back states). All 103 tests pass except the 2 old `app.spec.ts` ones. In the browser, driving the dialog into the step with a fake booking made the real `POST /v1/bookings/{ref}/checkout`, which answered 401 without a login token, and the screen showed "Payment did not start / Your session ended" with the retry button, at 1440 and 390 wide with no overflow. Production build: initial bundle 370.8 kB (366 kB before; the pay step is small and eager).
  - *Needs you, to finish the real check:* load PayU TEST credentials into the running backend (Swagger `/docs`, "dev" section, `PUT /dev/payu/credentials` with your test key, test salt and `env: "test"`; the backend forgets them on every restart; never paste the salt anywhere else). Then, signed in: Book now, fill the form, Pay. The browser should land on PayU's test page showing the booking amount (₹1 with the current database price). Pay with a PayU test card from the backend's `docs/plans/S4-payments/payu-spike/2026-10-17-p7-payu-test-runbook.md`.
  - *Known until FE-5:* PayU sends the browser back through the API to `/booking/{reference}`, a page that does not exist yet, so the app's catch-all shows Home. The payment result is still recorded by the backend; FE-5 adds the status page that shows it.
- [x] **FE-5 Status page. DONE and verified by the owner (2026-10-24): works after a real payment.** Lazy `BookingStatus` at `booking/:reference`; sign-in gate and return; poll every 2 s up to 60 s (stop on destroy, honour `Retry-After`); all states and `?e=` notices from the guide; `aria-live` on state changes; request id on generic errors. *Done when:* a test payment ends on CONFIRMED and a cancelled one on FAILED.
  - *Built:* route `booking/:reference` (lazy `BookingStatus`); `core/booking/booking-status.ts` (pure: `isFinal`, `viewOf`, `noticeFor`, `formatIst`); `BookingsService.get`. The page: checks the sign-in first (signed out: "Sign in to see this booking" with a Log in / Sign up button, and the poll starts the moment they sign in); reads `GET /v1/bookings/{ref}` now, then every 2 seconds for at most 60 seconds, stopping on a final answer, on `BOOKING_NOT_FOUND` ("We cannot find this booking"), on leaving the page, or on `UNAUTHENTICATED` (the auth service signs out and the sign-in prompt takes over); a `429` waits the `Retry-After` before the next read. Screens: confirming (spinner), still confirming after 60 s (with a Check again button), confirmed ("You're booked", the WhatsApp number, reference, package, amount, paid time in India time), failed (Book again), needs attention, completed, cancelled, expired, no-show, and a "Waiting for payment" screen with a Pay button for a booking whose payment never started and `canPay` is true. The `?e=verify|busy|server` flag only picks a small notice above the result. Request ids ride along in generic error messages.
  - *Deviations from the guide, on purpose:* (1) a payment of `SUCCESS` while the booking still says `PENDING_PAYMENT` does not stop the poll (the backend confirms the booking in the same step, so it is a moment of catching up); (2) a booking with no payment started is shown as "Waiting for payment", not "Confirming", and is not polled; (3) the still-confirming text does not link to My Bookings yet (arrives with FE-6).
  - *Checked:* 24 new tests with fake timers (sign-in gate, starts after sign-in, confirmed first read, every-2-seconds cadence to the exact millisecond, the 60 s window and Check again, failed + Book again, needs attention, 404, `Retry-After` wait, `?e=` notice, unpaid + Pay, stops on destroy; plus the pure status logic). 127 tests in total, only the old `app.spec.ts` pair fails. In the browser at 1440 and 390 (state set from the console, no login in that headless browser): the signed-out gate, and the confirmed screen with the notice and all four facts, no overflow.
  - *To verify by hand, signed in, after a payment:* the browser returns to `/booking/{reference}` and shows "Confirming your payment" then "You're booked" with the right paid time; open `/booking/` of a reference that is not yours and expect "We cannot find this booking"; cancel at PayU and expect the failed screen.
  - *FOUND FOR FE-6:* the backend redirects to `{FRONTEND_BASE_URL}/bookings?e=verify|busy|server` (plural, no reference) when it cannot tie a payment callback to a booking, but the guide and this plan call My Bookings `/my-bookings`. FE-6 must make `/bookings` land on My Bookings with the `e` flag preserved (a redirect route), or the backend should change its path.
- [x] **FE-6 My Bookings. DONE and verified by the owner (2026-10-24).** Lazy `my-bookings` route with guard; Active/Past tabs; opaque-cursor "Load more"; status label map; Pay only when `canPay`; row opens `/booking/:ref`; empty state; add the **My bookings** nav link (desktop bar, avatar menu, phone overlay). *Done when:* test bookings appear in the right tabs and a pending one can be paid.
  - *Built:* route `my-bookings` (lazy `MyBookings`) and a `bookings` route that redirects to it (the backend's payment-callback fallback, `?e=` flag kept: checked in the browser, `/bookings?e=verify` becomes `/my-bookings?e=verify` with the notice); `BookingsService.list(tab, cursor)` (`GET /v1/bookings?status=active|past&limit=20&cursor=...`, the cursor passed back untouched); `core/booking/booking-list.ts` (status words and tone). The page: sign-in first (signed-out prompt; the list loads as soon as they sign in); Active (default) and Past tabs as a proper tab list with arrow-key movement, each loading on first open and keeping its list; rows with package, reference, date in India time, amount and a status chip, the whole info area linking to `/booking/{ref}`; **Pay now** only when `canPay` is true (a separate button, not inside the link) with a per-row error; "Payment processing" when a payment is in progress; "Load more" (hidden at the end); empty state with Book now; load error with Try again; the `?e=` notice. Phone: rows stack as cards and Pay now is full width. The "My bookings" nav link (laptop bar, avatar menu, phone sheet) was already in place from FE-2b and now has a page behind it.
  - *Also wired now (were waiting on this page):* the status page's "still confirming" text links to My bookings; the booking form's "too many unpaid bookings" message shows an "Open My bookings" link (closing the dialog).
  - *Checked:* 18 new tests (the labels, `list()` params and cursor, and the page: signed-out gate, only Active loads on start, row contents and link, Pay now only when allowed and starts that booking's payment, row-level payment error, empty state, Past loads on first open, arrow keys, Load more with the exact cursor, load error and retry, the `?e=` notice; plus two for the form's link). 145 tests in total, only the old `app.spec.ts` pair fails. In the browser at 1440 and 390: the redirect, and the list with a Confirmed row, an Awaiting payment row with Pay now, a Payment processing row and Load more, no overflow.
  - *To verify by hand, signed in:* open My bookings from the navbar; your confirmed and pending bookings should appear in Active; Pay now on a pending one should take you to PayU; a booking that was cancelled or expired should be in Past; tap a row to open its status page.
- [x] **FE-7 Polish + Privacy. DONE 2026-10-24 (code, tests and axe); the Privacy wording needs the owner's (or a lawyer's) review before launch.** Global handling per the guide (401 gentle sign-out, 503 keep session + Retry, `RATE_LIMITED` countdown, `NETWORK` message), skeletons/spinners, axe pass, full responsive pass. **Privacy page:** I draft wording for the account and payment data (what is collected: sign-in email/name via Google or email link, booking details name/WhatsApp/email/age/city/gender, payment handled by PayU with no card data stored by us, Firebase as the sign-in provider), marked clearly as a draft for your or your lawyer's review. I will not invent retention periods or legal claims; those become bracketed blanks for you to fill.
  - *Global error handling:* new `app-session-notice` under the navbar on every page: after a person is signed out by an error while restoring a session (or the interceptor ends it after one token refresh) it says "Your session ended. Please sign in again." with Log in and Dismiss; when Google or the network was unreachable it says "We could not confirm your sign-in just now" with Try again and keeps the Firebase session. A sign-in that fails while the person is in the sign-in step keeps showing in that step, not site-wide. One shared `Countdown` (`core/util/countdown.ts`) replaces the two hand-rolled rate-limit timers and is now also used by My Bookings' Pay now and the status page's Pay: every such button disables with "Please wait Ns" for the time the API asked for. `NETWORK` shows "Check your connection and try again" everywhere via `describeError`.
  - *Privacy page (`/privacy`), updated to match what the backend really does, last-updated date now 24 October 2026:* sign-in (email, name from Google, how and when you signed in; Google/Firebase handles it, no Google password seen, a small sign-in record kept in the browser); the booking record, amount and payment status, the time of consent, and the IP address and browser details recorded with the booking and the payment (for fraud prevention and disputes; the backend stores these on `bookings` and `transactions`); payments by PayU (card/UPI details never seen or stored by us; PayU is sent the first name, email and a phone number); the old mention of a "service that delivers booking forms by email" replaced by Google, PayU, the hosting provider and WhatsApp/email. **For the owner to confirm before launch:** that this matches your practice, retention periods (the page still says only "as long as we need"; nothing specific was invented), the contact route, and the DPDP details. It remains a plain-language draft, not legal advice.
  - *Accessibility (axe-core 4.10.2, WCAG 2 A/AA, 2.1, 2.2 AA and best-practice, run in a real browser over 24 pages and states):* every screen and dialog from this integration passes: Events, Privacy, the sign-in dialog (including the "check your inbox" state and at phone width), the booking details form (empty and with all errors, laptop and phone), the pay step, the phone menu sheet (signed out and in), the account menu, the booking status page (signed out, confirmed, confirming), My Bookings (signed out, with rows, phone), `/auth/finish` (both states) and the session notice. One real failure was found and fixed on Home: the gut diagram's container was marked `role="img"` while holding focusable nodes; it is now a labelled `role="group"`. **Two older findings remain, left for the design refinement:** Home on a phone, the second expert carousel card's text fails colour contrast (the faded, not-yet-active card); and the Founders page jumps from the page title to an `h3` (heading order, a best-practice rule).
  - *Tests:* 158 pass and nothing fails: the long-broken `app.spec.ts` now passes too (it needed a `matchMedia` stub, a service-worker stub and a fake Firebase). New in this slice: 12 for the notice and the auth notice rules, 5 for the countdown, 2 for rate-limited Pay buttons.
  - *Not done, on purpose:* skeleton placeholders (every call already has a spinner or a text state; the visual refinement comes with the design pass); `BookingCtaService` is still in the code because Home writes to it, though nothing reads it any more (safe to remove with the design pass).
- [x] **FE-8 App Check (before staging). BUILT 2026-10-24 and switched OFF by default; turning it on needs a reCAPTCHA Enterprise key from the Firebase console (see below).** `initializeAppCheck` with reCAPTCHA Enterprise, interceptor adds `X-Firebase-AppCheck` to the three protected POSTs, debug token locally. Needs the site key.
  - *Built:* `core/auth/firebase-app.ts` (the one Firebase app, shared); `core/auth/app-check-client.ts` (`AppCheckClient`: lazy `firebase/app-check`, `initializeAppCheck` with `ReCaptchaEnterpriseProvider` and auto-refresh, optional debug token for localhost; on only when `environment.appCheck.siteKey` is set; a missing token never throws, the request just goes without the header and the API answers `APP_CHECK_FAILED`, which the app already words as "reload the page"); `core/auth/app-check.interceptor.ts` (adds `X-Firebase-AppCheck` to exactly three calls: `POST /v1/auth/sync`, `POST /v1/bookings`, `POST /v1/bookings/{ref}/checkout`; nothing else gets it). `environment.appCheck = { siteKey: null, debug }` in all three environments (`debug: true` locally only). With no key, nothing App Check related is loaded (checked: no request to App Check or reCAPTCHA hosts) and no header is sent, which matches the backend's `APP_CHECK_MODE=off`.
  - *Checked:* 8 new tests (which calls need it, header added to all three and only those, reads and public routes untouched without even asking for a token, nothing while off, still sends when no token could be had, client off without a key); 166 tests in total all pass; development, staging and production builds pass; production initial bundle 374.9 kB.
  - *To switch it on (needs you, in the Firebase console):* (1) App Check: register this web app with the reCAPTCHA Enterprise provider and create the site key; (2) put the key in `appCheck.siteKey` for the environment; (3) locally, keep `debug: true`, load the page once, copy the debug token the browser console prints, and register it under App Check, "Manage debug tokens"; (4) set the backend's `APP_CHECK_MODE` to `enforce` to prove it: sign-in sync, booking creation and checkout should still work, and the same calls without the header should be refused with `403 APP_CHECK_FAILED`. **Deployment task:** staging and production must have a key before the backend runs them in enforce mode, or sign-in sync, booking and payment will all be refused.
  - *Cleanup done with it:* the dev-only `?as=user` signed-in preview is removed from `AuthService` (real sign-in is verified).
- [~] **Then:** the guide's section 9 local test script (12 scenarios); record references for scenarios 3, 4, 6. Status, 2026-10-24:

  | # | Scenario | Status |
  |---|---|---|
  | 1 | Sign in with Google | Done by the owner: avatar shows, `users` row created, a second sign-in updated `last_login_at` on the same row. |
  | 2 | Sign in with an emailed link | NOT yet tried by a person (also settles the guide's "does an email-link login pass `/auth/sync`" question). Firebase accepts the request from the app. |
  | 3 | Book and pay by card | Done by the owner: card and UPI, two bookings, both `CONFIRMED` with `paid_at`. |
  | 4 | Cancel at PayU, expect the failed screen | NOT yet tried. The failed screen is covered by tests. |
  | 5 | Book for someone else (PayU form carries that person's details, `users` row unchanged) | NOT yet tried. |
  | 6 | Foreign number | Booking creation done by the owner (a 15-digit `+998...` number was accepted). Paying with the business fallback phone NOT yet tried. |
  | 7 | Double-click Submit then Pay | NOT tried by hand. Covered by tests: the button disables while sending, and an identical retry keeps its `Idempotency-Key`. |
  | 8 | Validation | Done by the owner for an invalid number; every other rule is covered by tests and was seen in the browser. |
  | 9 | Caps (5 unpaid, 5 confirmed today) | NOT yet tried; the message and the My bookings link are covered by tests. |
  | 10 | Tab closed during payment | NOT yet tried (needs the backend's settle step or its dev tick). |
  | 11 | Rate limit | NOT yet tried; the countdown and the disabled buttons are covered by tests. |
  | 12 | Open another account's booking | NOT yet tried; the "We cannot find this booking" screen is covered by tests. |

  Record the booking references and outcomes of scenarios 3, 4 and 6 (the evidence for the remaining PayU unknowns): scenario 3 references so far are `ED-8CT0AV` (card or UPI) and `ED-TA19JS` (the other).

## 5. Risks to keep in view

- **Popup blockers / in-app browsers** (Instagram, WhatsApp): `signInWithPopup` only from a click; email link is the fallback; the "type your email again" path for links opened on another device.
- **Booking created, payment not started:** now possible with no confirm screen (3.1). The retry-on-same-booking path and My Bookings cover it; the 5-unpaid-bookings cap (`TOO_MANY_PENDING_BOOKINGS`) is the backstop against repeated abandonment.
- **Personal data** never in URLs, logs, analytics, `localStorage`.
- **Navbar vs the scrollytelling hero:** the handover from nav button to pill must not cause layout shift or a flash of two CTAs; checked at every width in FE-2b.
- **Bundle size**: Lighthouse on Home must not regress; check build output per slice.
- **Service worker** serving a stale shell after deploy: `app-update.ts` exists; confirm it covers the new routes.
- **Signal Forms are new**: confirm the exact API in the installed version before FE-3b; fall back to Reactive Forms only if something blocks us, and tell you first.
- **Cross-origin in staging/prod** needs backend CORS + per-env API URL.
- **Backend blockers:** `GET /v1/packages` (FE-1), CORS (staging only), email alerts (after FE-5).

## 6. Open questions

1. **Navbar scope:** full links bar only in the hero (then compact pill + menu dot), as I read it in 3.2, or full bar at all times? 
2. **Phone top bar:** option A (logo mark + always-visible pill + menu dot, recommended) or option B (menu dot only, Book inside the overlay)?
3. **Log in / Sign up** as one button (recommended; sign-up happens automatically on first sign-in), or two separate links?
4. **Nav "Book a consultation" label** in the hero: keep the full phrase, or shorter "Book now" to save width on tablet?
