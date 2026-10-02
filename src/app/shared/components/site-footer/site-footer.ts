import { Component, output } from '@angular/core';
import { Wordmark } from '../wordmark/wordmark';
import { CtaPill } from '../cta-pill/cta-pill';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface FooterLink {
  readonly label: string;
  readonly href: string;
  /** Opens the booking form instead of navigating. */
  readonly book?: boolean;
}

/**
 * Oxblood-deep background (the site's one dark surface, same token the Team
 * cards and Descent panel already use) with olive as the secondary accent —
 * not the ember CTA gradient, that stays reserved for actual booking CTAs.
 * Socials and legal links are left as "#" placeholders until the founders
 * supply real ones — see need-review/footer-placeholders.md.
 */
@Component({
  selector: 'app-site-footer',
  imports: [Wordmark, CtaPill, EyebrowLabel],
  template: `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <app-wordmark [onDark]="true" [collapse]="false" />
          <p class="footer-tagline">Digestion-first, root-cause care — not a replacement for your doctor.</p>
          <app-cta-pill label="Book now" variant="ghostLight" (pressed)="bookRequested.emit()" />
        </div>

        <nav class="footer-col" aria-label="Section shortcuts">
          <app-eyebrow-label text="Explore" tone="dark" />
          <ul>
            @for (link of exploreLinks; track link.label) {
              <li><a [href]="link.href" (click)="onExploreClick($event, link)">{{ link.label }}</a></li>
            }
          </ul>
        </nav>

        <div class="footer-col">
          <app-eyebrow-label text="Connect" tone="dark" />
          <ul>
            @for (link of connectLinks; track link.label) {
              <li><a [href]="link.href">{{ link.label }}</a></li>
            }
          </ul>
          <div class="footer-socials">
            <a class="social" href="#" aria-label="Instagram">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect x="2.5" y="2.5" width="15" height="15" rx="4.5" />
                <circle cx="10" cy="10" r="3.6" />
                <circle cx="14.3" cy="5.7" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a class="social" href="#" aria-label="Facebook">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M12.5 7.2h-2V6c0-.6.4-.9 1-.9h1V2.5h-1.9c-2 0-3.1 1.3-3.1 3.3v1.4H6v3h1.5V18h3v-7.8h2.1l.4-3z" />
              </svg>
            </a>
            <a class="social" href="#" aria-label="YouTube">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect x="2" y="5.5" width="16" height="9" rx="3" />
                <path d="M8.5 8.3v3.4l3-1.7-3-1.7z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">&copy; {{ year }} Ease Disease. All rights reserved.</p>
        <ul class="footer-legal">
          @for (link of legalLinks; track link.label) {
            <li><a [href]="link.href">{{ link.label }}</a></li>
          }
        </ul>
      </div>
    </footer>
  `,
  styles: `
    .site-footer {
      background: var(--surface-deep);
      color: var(--text-quiet-dark);
      padding: var(--sp-16) var(--gutter-mobile) var(--sp-8);
      border-top: 1px solid var(--olive);
    }

    .footer-top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--sp-10);
      max-width: var(--container-max);
      margin-inline: auto;
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--sp-5);
    }

    .footer-tagline {
      margin: 0;
      font-size: 0.9rem;
      line-height: var(--lh-body);
      max-width: 38ch;
    }

    .footer-col ul {
      list-style: none;
      margin: var(--sp-4) 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }

    .footer-col a {
      color: var(--ivory);
      text-decoration: none;
      font-size: 0.92rem;
    }

    /* The socials/legal hrefs are still "#" placeholders, which resolve to
       the current page itself — browsers count that as "visited" on first
       paint, so without this the links would pick up the UA default visited
       color instead of the footer's own palette. */
    .footer-col a:visited {
      color: var(--ivory);
    }
    .footer-col a:hover,
    .footer-col a:focus-visible {
      color: var(--sage-soft);
    }

    .footer-socials {
      display: flex;
      gap: var(--sp-3);
      margin-top: var(--sp-5);
    }

    .social,
    .social:visited {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px var(--rule-on-dark);
      color: var(--ivory);
      transition:
        box-shadow var(--dur-micro) var(--ease),
        color var(--dur-micro) var(--ease);
    }
    .social:hover,
    .social:focus-visible {
      color: var(--sage-soft);
      box-shadow: inset 0 0 0 1px var(--sage-soft);
    }
    .social svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
      stroke-linejoin: round;
    }

    .footer-bottom {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      align-items: flex-start;
      max-width: var(--container-max);
      margin: var(--sp-12) auto 0;
      padding-top: var(--sp-6);
      border-top: 1px solid var(--rule-on-dark);
      font-size: 0.8rem;
    }

    .footer-copyright {
      margin: 0;
    }

    .footer-legal {
      list-style: none;
      display: flex;
      gap: var(--sp-5);
      margin: 0;
      padding: 0;
    }

    .footer-legal a,
    .footer-legal a:visited {
      color: var(--text-quiet-dark);
      text-decoration: underline;
      text-decoration-color: var(--rule-on-dark);
      text-underline-offset: 2px;
    }
    .footer-legal a:hover,
    .footer-legal a:focus-visible {
      color: var(--sage-soft);
    }

    @media (min-width: 900px) {
      .footer-top {
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--sp-12);
      }

      .footer-bottom {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
  `,
})
export class SiteFooter {
  readonly bookRequested = output<void>();

  protected readonly year = new Date().getFullYear();

  protected readonly exploreLinks: readonly FooterLink[] = [
    { label: 'Home', href: '#top' },
    { label: 'Why root-cause care', href: '#hook' },
    { label: 'Conditions we treat', href: '#root-map' },
    { label: 'Packages', href: '#programme' },
    { label: 'Meet the experts', href: '#experts' },
    { label: 'Book now', href: '#', book: true },
  ];

  protected onExploreClick(event: Event, link: FooterLink): void {
    if (link.book) {
      event.preventDefault();
      this.bookRequested.emit();
    }
  }

  protected readonly connectLinks: readonly FooterLink[] = [
    { label: 'Email us', href: '#' },
    { label: 'WhatsApp', href: '#' },
  ];

  protected readonly legalLinks: readonly FooterLink[] = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ];
}
