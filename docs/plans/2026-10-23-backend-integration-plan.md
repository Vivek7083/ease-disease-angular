# Backend integration plan: login, booking, payment (Angular side)

- **Status:** rev 3, 2026-10-23. Slices are built one at a time; after each: build/test green, tick it here, commit. Progress: navbar UI done (FE-2b, see below); FE-0 done; FE-1 on standby (live check passed, awaiting your confirmation); FE-2 and FE-3a done (Google sign-in verified); FE-3b built, awaiting a real booking test; next FE-4.
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
- **Placeholder:** `core/services/auth.ts` holds `ready` / `user` and a dev-only `?as=user` preview; Log in / Sign up does nothing until FE-2/FE-3a.

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
- [~] **FE-1 Package from the API. ON STANDBY: built and committed in fallback mode, NOT fully verified.** The backend session is implementing `GET /v1/packages` (2026-10-23). Open check, to run when it lands: change the package price in the database, refresh, and confirm the CTAs, Level card and dialog follow it; also confirm the real response matches `PackageItem` (fields `id, title, description[], pricePaise, currency, durationMinutes`) and that the original price is still a frontend constant. Until then the fallback copy must equal the seed package (30 min, ₹2,499).
  - *Live evidence (2026-10-23, backend session shipped the endpoint):* `GET /v1/packages` answers 200 with `Cache-Control: public, max-age=300` and exactly `id, title, description[], pricePaise, currency, durationMinutes`; Home's hero CTA now shows the database price. The local DB row currently has `pricePaise: 100` (so Home shows ₹1 beside the struck-through ₹5000): a test price, to be reset before anything is shown to real visitors. Still on standby until you confirm the slice. `PackagesService` with `mainPackage` signal. Until the backend ships `GET /v1/packages`: seed id in the environment file and existing `MAIN_PLAN` text. Replace price/duration consumers (`app.html` CTA pill, `booking-cta`, dialog) with the service; keep `₹5000` as a constant. Fix the stale Razorpay/Web3Forms comment in `booking.ts`. *Done when:* changing the DB price changes the page after refresh (or, in fallback mode, the id is wired and nothing visibly changes). **Real endpoint blocked on the backend.**
  - *Built:* `core/services/packages.ts` (`PackagesService`: `mainPackage`, `plan`, `packageId`, `durationWords`; loads `GET /v1/packages` once at start-up from `App`; any failure keeps the fallback silently). `core/config/booking.ts` is now the typed fallback copy (`Plan`, `MAIN_PLAN`) with the stale Razorpay/Web3Forms comment fixed. Home's hero and close CTAs, the Level 1 card (price, original price, duration note) and the booking dialog's header and thank-you price read the service. `BookingCtaService.plan` removed (nothing read it after the navbar change).
  - *Checked:* 7 new tests (fallback before load, API price/duration after load, original price stays the marketing constant, 404 and empty list keep fallback, one request only, rupee formatting). In the browser, Home still shows `30 min · ₹2499 / ₹5000` and the app's request for `/v1/packages` gets the backend's 404 with no console errors. The staging and production bundles each contain only their own API URL, which proves the environment `fileReplacements` (closing the FE-0 gap).
  - *Still to do when the backend ships the endpoint:* the "change the DB price, refresh, page changes" check. Until then a wrong fallback price could differ from what the server charges, so keep `MAIN_PLAN` equal to the seed package (30 min, ₹2,499).
  - *Left for FE-3b:* the demo thank-you screen's literal "(30 minutes)" and demo-mode notes, which are deleted when that screen is replaced. Prices there now use the service but lose the thousands comma ("₹2499", matching Home).
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
- [~] **FE-3b Details step on Signal Forms, talking to the API. BUILT 2026-10-24; creating a real booking while genuinely signed in still to be clicked through by a person.** Rewrite onto Signal Forms (decision 3); field mapping and rules per the guide; `POST /v1/bookings` with `Idempotency-Key`; Submit disabled in flight; all FE-3 error codes mapped; server field errors shown under the right control. Submit button reads "Pay ₹2,499". *Done when:* a `PENDING_PAYMENT` row exists with the typed details and every error shows a clear message.
  - *Built:* `details-step.ts` (the booking form moved out of the shell and rewritten on Signal Forms; same look, plus a "Include your country code" hint and per-field messages; phone starts as `+91 `; the Pay button shows `Pay ₹<price>` from the package); `core/booking/booking-rules.ts` (the API's rules mirrored: name and city 2-100, `+` phone 8-15 digits with a bare 10-digit Indian mobile getting `+91`, PayU email pattern up to 50 characters, age 1-119 as a number, optional gender omitted when empty; request builder that never carries a price or notes); `core/booking/attempt-key.ts` (same request keeps its `Idempotency-Key`, any edit makes a new one); `core/services/bookings.ts` (`POST /v1/bookings`); `PackagesService.reload()`. Errors: field complaints from `VALIDATION_FAILED` go under the right control (`whatsappNumber` under the phone field), `IDEMPOTENCY_CONFLICT` retries once with a new key, `RATE_LIMITED` shows the wait and disables Pay with a countdown, package off sale shows the message and reloads the package, everything else uses the shared `describeError`. The shell (`booking-form.ts`) is now only the frame plus four views (checking, sign-in, details, created) and no longer imports Reactive Forms.
  - *Interim screen:* after a 201 the dialog shows "Booking created" with the reference, package, name and amount, and says the payment step comes next. FE-4 replaces this with the hand-over to PayU. The Pay button creates the booking only, until FE-4 lands.
  - *Not done here on purpose:* the `TOO_MANY_PENDING_BOOKINGS` message has no "My bookings" link yet (the page arrives in FE-6); `notes` is not offered (owner decision).
  - *Checked:* 31 new tests (rules, attempt key, bookings call, and the step: empty submit shows every missing field and sends nothing, exact request body, gender and bare-number handling, server field error under the phone field, same key on an identical retry, new key after an edit, conflict retry, rate-limit countdown, package-off-sale reload, daily limit). In the browser at 1440 and 390: validation messages, focus lands on the first problem, radio group named automatically, no overflow; a real `POST /v1/bookings` without a login token comes back 401 and the form shows "Your session ended. Please sign in again." with the button restored. Production build: initial bundle is 366 kB (it was 417 kB: removing Reactive Forms from the always-loaded shell more than paid for the new code); details step is a 14.5 kB lazy chunk.
  - *Lesson recorded:* inputs with `[formField]` must not carry `required`, `min`, `max`, `maxlength` or `name` attributes (compile error NG8022); the schema validators own those, and radios are named automatically.
  - *To verify by hand (signed in with Google):* Book now, fill the form, Pay: a row appears in `bookings` with status `PENDING_PAYMENT` and the typed details (which may differ from the account's name and email), and the dialog shows the reference. Then press Book now again with identical details to see a second booking, and check a bad phone number or an under-age value for the messages.
- [ ] **FE-4 Pay (immediately after create).** `PaymentService.startPayment(reference)`: checkout call, hidden form POST to `gatewayUrl` with `fields` untouched and unstored; "Taking you to payment..." state; one shared flow for Submit and for My Bookings' Pay now; the retry-payment-on-same-booking behaviour from 3.1; error map (`BOOKING_NOT_PAYABLE` to status page, `PAYMENT_PHONE_UNSUPPORTED`, `PAYMENT_GATEWAY_UNAVAILABLE`, etc.). *Done when:* Submit lands on PayU's test page with the right amount. Needs the backend running with PayU test credentials loaded.
- [ ] **FE-5 Status page.** Lazy `BookingStatus` at `booking/:reference`; sign-in gate and return; poll every 2 s up to 60 s (stop on destroy, honour `Retry-After`); all states and `?e=` notices from the guide; `aria-live` on state changes; request id on generic errors. *Done when:* a test payment ends on CONFIRMED and a cancelled one on FAILED.
- [ ] **FE-6 My Bookings.** Lazy `my-bookings` route with guard; Active/Past tabs; opaque-cursor "Load more"; status label map; Pay only when `canPay`; row opens `/booking/:ref`; empty state; add the **My bookings** nav link (desktop bar, avatar menu, phone overlay). *Done when:* test bookings appear in the right tabs and a pending one can be paid.
- [ ] **FE-7 Polish + Privacy.** Global handling per the guide (401 gentle sign-out, 503 keep session + Retry, `RATE_LIMITED` countdown, `NETWORK` message), skeletons/spinners, axe pass, full responsive pass. **Privacy page:** I draft wording for the account and payment data (what is collected: sign-in email/name via Google or email link, booking details name/WhatsApp/email/age/city/gender, payment handled by PayU with no card data stored by us, Firebase as the sign-in provider), marked clearly as a draft for your or your lawyer's review. I will not invent retention periods or legal claims; those become bracketed blanks for you to fill.
- [ ] **FE-8 App Check (before staging).** `initializeAppCheck` with reCAPTCHA Enterprise, interceptor adds `X-Firebase-AppCheck` to the three protected POSTs, debug token locally. Needs the site key.
- [ ] **Then:** the guide's section 9 local test script (12 scenarios); record references for scenarios 3, 4, 6.

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
