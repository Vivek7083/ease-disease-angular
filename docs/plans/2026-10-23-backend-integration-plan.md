# Backend integration plan: login, booking, payment (Angular side)

- **Status:** rev 3, 2026-10-23. Slices are built one at a time; after each: build/test green, tick it here, commit. Progress: navbar UI done (FE-2b, see below); FE-0 in progress.
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

- [ ] **FE-0 Plumbing (no visible change).** `environments/*` (Firebase **placeholders**, `useAuthEmulator`) + `fileReplacements`; `provideHttpClient(withInterceptors)`; `core/api/{api-types,api-error,api-client}.ts`; error-mapping interceptor (reads `Retry-After`, `X-Request-Id`); `proxy.conf.json` wired into `angular.json` serve; install `firebase`; check `ngsw-config.json` does not cache `/v1/**` and `vercel.json` rewrites deep links (`/booking/*`, `/my-bookings`, `/auth/finish`) to the app. Unit tests for the error mapper (404, 400 fields, 429, status 0 to NETWORK). *Done when:* `GET /healthz` via the proxy works and a 404 surfaces as `ApiError` with `requestId`.
- [ ] **FE-1 Package from the API.** `PackagesService` with `mainPackage` signal. Until the backend ships `GET /v1/packages`: seed id in the environment file and existing `MAIN_PLAN` text. Replace price/duration consumers (`app.html` CTA pill, `booking-cta`, dialog) with the service; keep `₹5000` as a constant. Fix the stale Razorpay/Web3Forms comment in `booking.ts`. *Done when:* changing the DB price changes the page after refresh (or, in fallback mode, the id is wired and nothing visibly changes). **Real endpoint blocked on the backend.**
- [ ] **FE-2 Sign in (service layer).** Lazy `firebase` init (with optional `connectAuthEmulator`); `AuthService` (`user`, `profile`, `ready`, `busy`; Google popup, email link, finish, sign out, `/auth/sync` then `/me`); auth interceptor (Bearer token, one refresh-and-retry on 401, then sign out); `auth/finish` lazy route (page itself responsive: centred card with a status line and a "type your email again" form on a different device). Handle `EMAIL_NOT_VERIFIED`, `UNSUPPORTED_SIGN_IN_PROVIDER`, `AUTH_UNAVAILABLE` (keep session) per the guide. *Done when* (emulator is fine): sign-in with both methods creates the `users` row, refresh keeps the session, sign out works. Watch the email-link provider "known unknown".
- [~] **FE-2b Navbar redesign. UI DONE (committed); auth-driven behaviour waits for FE-2 and FE-3a.** Section 3.2: nav links row, Book button, auth-aware Log in / Sign up and avatar menu, menu dot + overlay on phone (reworked from `menu-dot`), hero-to-pill handover, non-home pages keep the full bar. Log in / Sign up opens the dialog in `sign-in` mode (needs FE-3a's sign-in step; if FE-3a is not done yet, FE-2b builds the sign-in step first as a small shared component). "My bookings" link is added with FE-6 so it never points at a missing route. *Done when:* every state in 3.2 works at 320, 375, 414, 768, 1024, 1440, keyboard-only, with no layout shift when auth resolves.
- [ ] **FE-3a Dialog restructure + sign-in step.** Extract step components; signed-out `book` mode opens on sign-in; draft saved to `sessionStorage` for the email-link leg and restored on return. No booking API call yet. *Done when:* a signed-in user sees the same form as today and the signed-out path works at all breakpoints.
- [ ] **FE-3b Details step on Signal Forms, talking to the API.** Rewrite onto Signal Forms (decision 3); field mapping and rules per the guide; `POST /v1/bookings` with `Idempotency-Key`; Submit disabled in flight; all FE-3 error codes mapped; server field errors shown under the right control. Submit button reads "Pay ₹2,499". *Done when:* a `PENDING_PAYMENT` row exists with the typed details and every error shows a clear message.
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
