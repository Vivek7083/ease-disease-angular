import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The signed-in avatar in the navbar and the small panel under it. A
 * disclosure (button + panel), not an ARIA menu: it holds a heading line and
 * ordinary links, so Tab moves through it naturally. Escape and a click
 * outside close it; Escape returns focus to the avatar.
 */
@Component({
  selector: 'app-account-menu',
  imports: [RouterLink],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'onEscape()',
  },
  template: `
    <button
      #trigger
      type="button"
      class="avatar"
      aria-haspopup="true"
      aria-controls="account-panel"
      [attr.aria-expanded]="open()"
      aria-label="Your account"
      (click)="open.update((v) => !v)"
    >
      {{ initial() }}
    </button>

    @if (open()) {
      <div class="panel" id="account-panel">
        <p class="who">
          <span class="who-label">Signed in as</span>
          <span class="who-email">{{ email() }}</span>
        </p>
        <a class="item" routerLink="/my-bookings" (click)="open.set(false)">My bookings</a>
        <button type="button" class="item" (click)="onSignOut()">Sign out</button>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.95rem;
      text-transform: uppercase;
      color: var(--ivory);
      background: var(--oxblood);
      border: 0;
      cursor: pointer;
      transition: transform var(--dur-micro) var(--ease);
    }
    .avatar:hover {
      transform: translateY(-1px);
    }
    .avatar:focus-visible,
    .item:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .panel {
      position: absolute;
      top: calc(100% + var(--sp-2));
      right: 0;
      min-width: 232px;
      padding: var(--sp-2);
      border-radius: var(--r-md);
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      box-shadow: 0 18px 40px -20px color-mix(in oklab, var(--oxblood-deep) 45%, transparent);
      display: flex;
      flex-direction: column;
    }
    .who {
      margin: 0;
      padding: var(--sp-2) var(--sp-3) var(--sp-3);
      border-bottom: 1px solid var(--rule-on-light);
      margin-bottom: var(--sp-2);
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .who-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }
    .who-email {
      font-size: 0.9rem;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
    .item {
      display: flex;
      align-items: center;
      min-height: var(--tap-min);
      padding: 0 var(--sp-3);
      border: 0;
      border-radius: var(--r-sm);
      background: none;
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--ink);
      text-decoration: none;
      text-align: left;
      cursor: pointer;
    }
    .item:hover {
      background: var(--surface-glass-light);
    }
  `,
})
export class AccountMenu {
  readonly email = input.required<string>();
  readonly name = input<string | null>(null);
  readonly signOut = output<void>();

  protected readonly open = signal(false);
  protected readonly initial = computed(() => (this.name() || this.email()).trim().charAt(0) || '?');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected onEscape(): void {
    if (this.open()) {
      this.open.set(false);
      this.trigger()?.nativeElement.focus();
    }
  }

  protected onSignOut(): void {
    this.open.set(false);
    this.signOut.emit();
  }
}
