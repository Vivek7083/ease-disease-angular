import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { BookingModalService } from '../../../core/services/booking-modal';
import { AccountMenu } from '../account-menu/account-menu';
import { CtaPill } from '../cta-pill/cta-pill';
import { MenuDot } from '../menu-dot/menu-dot';
import { Wordmark } from '../wordmark/wordmark';
import type { NavLink } from '../menu-dot/menu-dot';

/**
 * The top navigation on every page: a full-width white glass bar pinned to the
 * top of the screen, that page content scrolls underneath. From 900px up it is
 * three columns on one centre line: the brand on the left, the links in the
 * middle (Events, Experts, and My bookings once signed in), and the account
 * control with Book now on the right. Below 900px the links move into the
 * menu button's sheet; below 375px the brand shrinks to just the logo so the
 * logo, Book now and the menu button still fit at 320px.
 */
@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, Wordmark, CtaPill, AccountMenu, MenuDot],
  template: `
    <header class="bar">
      <div class="inner">
        <app-wordmark class="brand" [collapse]="false" [compact]="narrow()" />

        <nav class="links" aria-label="Main">
          @for (link of links(); track link.label) {
            <a [routerLink]="link.route" [fragment]="link.fragment">{{ link.label }}</a>
          }
        </nav>

        <div class="actions">
          @if (auth.ready()) {
            <div class="account">
              @if (auth.user(); as user) {
                <app-account-menu [email]="user.email" [name]="user.name" (signOut)="auth.signOut()" />
              } @else {
                <button type="button" class="login" (click)="auth.openSignIn()">Log in / Sign up</button>
              }
            </div>
          }
          <app-cta-pill label="Book now" variant="primary" [compact]="true" (pressed)="book()" />
          <app-menu-dot
            class="menu"
            [links]="links()"
            [signedInEmail]="auth.user()?.email ?? null"
            (signIn)="auth.openSignIn()"
            (signOut)="auth.signOut()"
            (book)="book()"
          />
        </div>
      </div>
    </header>
  `,
  styles: `
    /* Pinned to the top edge on every screen size. */
    :host {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 40;
      display: block;
    }
    /* Full-width white glass (90% opaque). Page content slides under it and
       stays faintly visible through the blur; a hairline marks its lower edge. */
    .bar {
      padding-top: env(safe-area-inset-top, 0px);
      background: color-mix(in oklab, var(--surface-card-light) 90%, transparent);
      -webkit-backdrop-filter: var(--blur-panel);
      backdrop-filter: var(--blur-panel);
      border-bottom: 1px solid color-mix(in oklab, var(--rule-on-light) 75%, transparent);
    }
    /* Same left/right edges as .scene-inner (a centred --container-max box with a
       gutter), so the logo lines up with the hero copy. */
    .inner {
      box-sizing: border-box;
      max-width: var(--container-max);
      margin-inline: auto;
      min-height: 60px;
      padding: var(--sp-2) var(--sp-4);
      display: flex;
      align-items: center;
      gap: var(--sp-3);
    }
    .brand {
      flex: none;
      display: flex;
      align-items: center;
    }
    .links {
      display: none;
    }
    .actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }
    .account {
      display: none;
    }
    .login,
    .links a {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0 var(--sp-4);
      border: 0;
      border-radius: var(--r-pill);
      background: none;
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--ink);
      white-space: nowrap;
      cursor: pointer;
      /* A thin always-on underline, set off from the text so it reads as a link. */
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 6px;
      text-decoration-color: color-mix(in oklab, var(--ink) 45%, transparent);
      transition:
        background var(--dur-micro) var(--ease),
        text-decoration-color var(--dur-micro) var(--ease);
    }
    .login:hover,
    .links a:hover {
      background: var(--surface-glass-light);
      text-decoration-color: var(--oxblood);
    }
    .login:focus-visible,
    .links a:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }

    @media (min-width: 641px) {
      .inner {
        min-height: 72px;
        padding-inline: var(--sp-6);
      }
    }

    /* Laptop and up: brand | links | actions, links truly centred, no menu button. */
    @media (min-width: 900px) {
      .inner {
        display: grid;
        grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr);
        padding-inline: var(--gutter-desktop);
      }
      .links {
        display: flex;
        align-items: center;
        gap: var(--sp-1);
      }
      .actions {
        justify-self: end;
        margin-left: 0;
      }
      .account {
        display: block;
      }
      .menu {
        display: none;
      }
    }
  `,
})
export class SiteNav {
  protected readonly auth = inject(AuthService);
  private readonly bookingModal = inject(BookingModalService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly router = inject(Router);

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
      startWith(this.router.url.split(/[?#]/)[0]),
    ),
    { initialValue: '/' },
  );

  /**
   * The links for the page you are on: the one that points at this page is left
   * out, and everywhere except Home a "Home" link comes first. So on Events you
   * see Home and Experts, on Privacy you see Home, Events and Experts. Experts
   * is a section of Home, so it always stays.
   */
  protected readonly links = computed<readonly NavLink[]>(() => {
    const path = this.path();
    const all: NavLink[] = [
      { label: 'Home', route: '/' },
      { label: 'Events', route: '/events' },
      { label: 'Experts', route: '/', fragment: 'experts' },
      ...(this.auth.user() ? [{ label: 'My bookings', route: '/my-bookings' }] : []),
    ];
    return all.filter((link) => link.fragment || link.route !== path);
  });

  /** True below 375px, where the brand shows only its logo. */
  protected readonly narrow = signal(false);

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const query = window.matchMedia('(max-width: 374px)');
    const update = () => this.narrow.set(query.matches);
    update();
    query.addEventListener('change', update);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', update));
  }

  protected book(): void {
    this.bookingModal.open();
  }
}
