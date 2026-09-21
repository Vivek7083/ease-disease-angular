import { Component, signal } from '@angular/core';

interface MenuLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-menu-dot',
  template: `
    <button
      type="button"
      class="dot"
      aria-haspopup="true"
      [attr.aria-expanded]="open()"
      aria-controls="menuOverlay"
      aria-label="Open menu"
      (click)="open.set(true)"
    >
      <span></span>
    </button>

    <div
      class="overlay"
      id="menuOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      [class.open]="open()"
      (keydown.escape)="open.set(false)"
    >
      <button type="button" class="close" aria-label="Close menu" (click)="open.set(false)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
      <nav class="links">
        @for (link of links; track link.label) {
          <a [href]="link.href" (click)="open.set(false)">{{ link.label }}</a>
        }
      </nav>
    </div>
  `,
  styles: `
    .dot {
      width: 44px;
      height: 44px;
      border-radius: var(--r-pill);
      display: grid;
      place-items: center;
      background: var(--surface-glass-light);
      backdrop-filter: var(--blur-panel);
      border: 1px solid var(--rule-on-light);
      cursor: pointer;
    }
    .dot span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--oxblood);
      box-shadow:
        0 -9px 0 var(--oxblood),
        0 9px 0 var(--oxblood);
      display: block;
    }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: var(--surface-deep);
      color: var(--ivory);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--sp-8);
      opacity: 0;
      pointer-events: none;
      transition:
        opacity var(--dur-base) var(--ease);
    }
    .overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .close {
      position: absolute;
      top: var(--sp-6);
      right: var(--sp-6);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface-glass-dark);
      color: var(--ivory);
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .links {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-6);
    }
    .links a {
      font-family: var(--font-display);
      font-size: var(--fs-display-s);
      text-decoration: none;
      color: var(--ivory);
      transition: color var(--dur-micro) var(--ease);
    }
    .links a:hover {
      color: var(--honey);
    }
  `,
})
export class MenuDot {
  readonly open = signal(false);

  readonly links: readonly MenuLink[] = [
    { label: 'Events', href: '#events' },
    { label: 'Community', href: '#community' },
    { label: 'Log in', href: '#login' },
  ];
}
