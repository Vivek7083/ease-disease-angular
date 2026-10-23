import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';

/**
 * A small notice under the navbar, on every page, for the two sign-in situations that are not the person's doing:
 * the session ended (they were signed out), or Google / the network was unreachable when we tried to confirm their
 * sign-in (their Firebase session is kept, so "Try again" is enough). Nothing is shown the rest of the time.
 */
@Component({
  selector: 'app-session-notice',
  template: `
    @if (auth.sessionNotice(); as text) {
      <div class="note" role="status">
        <span class="text">{{ text }}</span>
        <button type="button" class="action" (click)="auth.openSignIn()">Log in</button>
        <button type="button" class="dismiss" aria-label="Dismiss this message" (click)="auth.dismissNotice()">&times;</button>
      </div>
    } @else if (auth.needsRetry()) {
      <div class="note" role="alert">
        <span class="text">We could not confirm your sign-in just now.</span>
        <button type="button" class="action" (click)="auth.retry()">Try again</button>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      z-index: 39;
      left: 0;
      right: 0;
      top: calc(env(safe-area-inset-top, 0px) + 84px);
      display: flex;
      justify-content: center;
      padding-inline: var(--sp-4);
      pointer-events: none;
    }
    .note {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      max-width: 560px;
      padding: var(--sp-2) var(--sp-2) var(--sp-2) var(--sp-4);
      border-radius: var(--r-pill);
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      box-shadow: 0 12px 32px -16px color-mix(in oklab, var(--oxblood-deep) 45%, transparent);
      font-size: 0.9rem;
      line-height: 1.4;
    }
    .text {
      flex: 1 1 auto;
      min-width: 0;
    }
    .action,
    .dismiss {
      flex: none;
      min-height: 36px;
      border-radius: var(--r-pill);
      font: inherit;
      cursor: pointer;
    }
    .action {
      padding: 0 var(--sp-4);
      border: 0;
      background-image: var(--gradient-ember);
      color: var(--ivory);
      font-weight: 500;
    }
    .dismiss {
      width: 36px;
      border: 0;
      background: var(--surface-glass-light);
      color: var(--ink);
      font-size: 1.2rem;
      line-height: 1;
    }
    .action:focus-visible,
    .dismiss:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    @media (max-width: 640px) {
      :host {
        top: calc(env(safe-area-inset-top, 0px) + 68px);
      }
      .note {
        border-radius: var(--r-md);
      }
    }
  `,
})
export class SessionNotice {
  protected readonly auth = inject(AuthService);
}
