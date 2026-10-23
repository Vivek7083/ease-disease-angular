import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingModalService } from '../../core/services/booking-modal';
import { EyebrowLabel } from '../../shared/components/eyebrow-label/eyebrow-label';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

/**
 * Routed at /privacy, and always opened in a new tab from the booking form's
 * consent tick-box and the footer. A plain-language DRAFT written for this
 * site; it should be read and approved by the founders (and ideally a lawyer)
 * before launch, because the booking form collects health-related information
 * and India's Digital Personal Data Protection Act 2023 applies.
 */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink, EyebrowLabel, SiteFooter],
  template: `
    <main class="pp-page">
      <header class="pp-hero">
        <div class="pp-inner">
          <app-eyebrow-label text="Your information" />
          <h1>Our <span class="mark">Privacy</span> Policy</h1>
          <p class="pp-updated">Last updated 24 October 2026</p>
          <p class="pp-lede">
            Ease Dis-ease ("we", "us") helps people find the root cause of their health concerns. This page explains, in plain words, what we
            collect when you use this website or book a consultation, why we collect it, and the choices you have.
          </p>
        </div>
      </header>

      <div class="pp-inner pp-body">
        <section>
          <h2>What we collect</h2>
          <p>When you sign in, we receive:</p>
          <ul>
            <li>your email address and, if you sign in with Google, your name;</li>
            <li>how you signed in (with Google, or with a link we email you) and when.</li>
          </ul>
          <p>
            Sign-in is provided by Google (Firebase Authentication). We never see your Google password, and signing in with an emailed link
            needs no password at all. To keep you signed in, your browser stores a small sign-in record on your device.
          </p>
          <p>When you use the booking form, you give us:</p>
          <ul>
            <li>your name, WhatsApp number and email address;</li>
            <li>your age and your city;</li>
            <li>your gender, if you choose to tell us.</li>
          </ul>
          <p>
            When you book and pay, we also keep a record of the booking, its amount and its payment status, the time you gave your consent,
            and the internet address (IP address) and browser details the booking and the payment came from. We use these to prevent fraud
            and to settle any question about a booking or a payment.
          </p>
          <p>
            Payments are taken by PayU. You enter your card or UPI details on PayU's page, and we never see or store them. For the payment we
            send PayU your first name, your email address and a phone number, and PayU tells us whether the payment worked and how it was made.
          </p>
          <p>
            Before or during your consultation we may also ask about your health, such as your symptoms, diet, sleep, stress and any
            medicines. This is sensitive information, and we only ask for it with your consent.
          </p>
          <p>
            Like most websites, our hosting provider receives basic technical details when your browser loads a page, such as your IP address
            and device type. This site also loads its fonts from Google Fonts, so your browser contacts Google to get them. We do not use
            advertising trackers on this site.
          </p>
        </section>

        <section>
          <h2>Why we use it</h2>
          <ul>
            <li>to let you sign in and see your bookings;</li>
            <li>to prepare for your consultation and to run it well;</li>
            <li>to contact you, usually on WhatsApp or email, about your booking and your consultation;</li>
            <li>to confirm and take payment for your booking.</li>
          </ul>
          <p>We do not use your information for advertising, and we do not sell it.</p>
        </section>

        <section>
          <h2>Your consent</h2>
          <p>
            We ask for your consent when you book. By giving it, you agree to us using your information as described on this page. You can
            withdraw your consent at any time by contacting us, and we will then stop using your information for anything that depends on it.
          </p>
        </section>

        <section>
          <h2>Who sees it</h2>
          <p>
            Your information is seen by our team. We also use a few services that help us run the booking: Google, to sign you in; PayU, to
            take your payment; our hosting provider; and WhatsApp or email to talk with you. They handle your information only to provide
            that service. We do not share it with anyone else, unless the law requires us to.
          </p>
        </section>

        <section>
          <h2>How long we keep it, and keeping it safe</h2>
          <p>
            We keep your information only for as long as we need it to look after you and to meet legal or record-keeping duties. You can ask us
            to delete it earlier. We take sensible steps to protect it, but no website or message service can promise perfect security.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>Under India's Digital Personal Data Protection Act, 2023, you can ask us to:</p>
          <ul>
            <li>tell you what information we hold about you;</li>
            <li>correct anything that is wrong or out of date;</li>
            <li>delete your information;</li>
            <li>withdraw your consent;</li>
            <li>deal with a complaint, if you are unhappy with how we have handled your information.</li>
          </ul>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            Our consultations are for adults. If you are booking for someone under 18, please be their parent or guardian and fill in the form
            on their behalf.
          </p>
        </section>

        <section>
          <h2>Changes to this page</h2>
          <p>If we change how we handle your information, we will update this page and the date at the top.</p>
        </section>

        <section>
          <h2>Contact us</h2>
          <p>
            To ask a question or use any of your rights, write to us using the "Email us" or "WhatsApp" links in the footer of this page.
          </p>
          <p class="pp-back"><a routerLink="/">Back to the home page</a></p>
        </section>
      </div>
    </main>

    <app-site-footer (bookRequested)="booking.open()" />
  `,
  styles: `
    :host {
      display: block;
    }
    .pp-page {
      background: var(--ivory);
      color: #000;
    }
    .pp-inner {
      max-width: 760px;
      margin-inline: auto;
      padding-inline: var(--gutter-mobile);
    }
    @media (min-width: 900px) {
      .pp-inner {
        padding-inline: var(--gutter-desktop);
      }
    }

    .pp-hero {
      /* Clears the fixed wordmark and booking chrome, same as the founders and events pages. */
      padding-top: max(calc(var(--sp-20) + env(safe-area-inset-top, 0px)), calc(var(--sp-10) + 8vw));
      padding-bottom: var(--sp-6);
    }
    .pp-hero h1 {
      margin-top: var(--sp-3);
      font-size: var(--fs-display-m);
    }
    .mark {
      font-style: normal;
      background: linear-gradient(transparent 52%, var(--highlight-blue) 52%);
      padding: 0 4px;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }
    .pp-updated {
      margin-top: var(--sp-3);
      font-family: var(--font-mono);
      font-size: 0.76rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
    }
    .pp-lede {
      margin-top: var(--sp-5);
      font-size: 1.1rem;
      line-height: var(--lh-body);
    }

    .pp-body {
      padding-block: var(--sp-6) clamp(var(--sp-10), 6vw, var(--sp-16));
    }
    .pp-body section {
      padding-block: var(--sp-6);
      border-top: 1px solid var(--rule-on-light);
    }
    .pp-body h2 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-display-s);
      line-height: 1.2;
      margin: 0 0 var(--sp-3);
    }
    .pp-body p,
    .pp-body li {
      font-family: var(--font-body);
      font-size: 1.02rem;
      line-height: 1.65;
    }
    .pp-body p {
      margin: 0 0 var(--sp-3);
    }
    .pp-body ul {
      margin: 0 0 var(--sp-3);
      padding-left: 1.25rem;
    }
    .pp-body li {
      margin-bottom: var(--sp-1);
    }
    .pp-body li::marker {
      color: var(--oxblood);
    }
    .pp-body a {
      color: var(--oxblood);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .pp-body a:hover {
      text-decoration-thickness: 2px;
    }
    .pp-body a:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
      border-radius: 2px;
    }
    .pp-back {
      margin-top: var(--sp-5);
    }
  `,
})
export class Privacy {
  protected readonly booking = inject(BookingModalService);
}
