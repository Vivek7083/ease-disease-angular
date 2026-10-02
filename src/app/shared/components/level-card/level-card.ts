import { Component, input, output } from '@angular/core';
import { EvidenceTick } from '../evidence-tick/evidence-tick';
import { CtaPill } from '../cta-pill/cta-pill';

export interface Level {
  readonly tag: string;
  readonly name: string;
  /** Omitted for a level with no price to show yet. */
  readonly price?: string;
  /** Struck-through anchor price shown beside the real one. */
  readonly originalPrice?: string;
  readonly priceNote?: string;
  readonly ctaLabel: string;
  /** A single-line description, for a package whose scope isn't broken into
   *  bullet features yet (e.g. still template/TBC from the source PRD). */
  readonly description?: string;
  readonly features?: readonly string[];
  readonly recommended?: boolean;
  /** Shown but not purchasable yet — the card dims, wears a lock, and its CTA points back to the level that unlocks it. */
  readonly locked?: boolean;
  readonly lockedNote?: string;
}

@Component({
  selector: 'app-level-card',
  imports: [EvidenceTick, CtaPill],
  template: `
    <article class="level" [class.recommended]="level().recommended" [class.locked]="level().locked">
      @if (level().recommended) {
        <span class="badge">Most recommended</span>
      }
      @if (level().locked) {
        <span class="lock-badge">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="4.5" y="9" width="11" height="8" rx="1.8" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          Locked
        </span>
      }
      <span class="tag">{{ level().tag }}</span>
      <h3>{{ level().name }}</h3>
      @if (level().price; as price) {
      <p class="price">
        @if (level().originalPrice; as original) {
          <s class="was"><span class="sr-only">Original price </span>{{ original }}</s>
        }
        {{ price }}
        @if (level().priceNote; as note) {
          <span class="note">{{ note }}</span>
        }
      </p>
      }
      @if (level().description; as description) {
        <p class="description">{{ description }}</p>
      } @else if (level().features; as features) {
        <ul>
          @for (feature of features; track feature) {
            <li>
              <app-evidence-tick />
              {{ feature }}
            </li>
          }
        </ul>
      }
      @if (level().locked) {
        @if (level().lockedNote; as lockedNote) {
          <p class="locked-note">{{ lockedNote }}</p>
        }
        <app-cta-pill class="cta" [label]="level().ctaLabel" variant="ghostDark" (pressed)="unlockRequested.emit()" />
      } @else {
        <app-cta-pill class="cta" [label]="level().ctaLabel" variant="primary" (pressed)="booked.emit()" />
      }
    </article>
  `,
  styles: `
    .level {
      position: relative;
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      border-radius: var(--r-lg);
      padding: var(--sp-6);
      box-shadow: var(--shadow-soft);
      transition:
        transform var(--dur-base) var(--ease),
        box-shadow var(--dur-base) var(--ease);
    }
    .level:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lift);
    }
    .level.recommended {
      border: 1.5px solid transparent;
      background-image:
        linear-gradient(var(--surface-card-light), var(--surface-card-light)), var(--gradient-ember);
      background-origin: border-box;
      background-clip: padding-box, border-box;
    }
    .level.locked {
      background: color-mix(in oklab, var(--surface-card-light) 70%, transparent);
      box-shadow: none;
    }
    .level.locked .tag,
    .level.locked h3,
    .level.locked .price,
    .level.locked .description {
      opacity: 0.55;
    }
    .lock-badge {
      float: right;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 0.66rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--oxblood);
    }
    .lock-badge svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .locked-note {
      margin: var(--sp-4) 0 0;
      font-size: 0.9rem;
      color: var(--oxblood);
    }
    .was {
      margin-right: var(--sp-2);
      font-size: 1.1rem;
      color: var(--text-quiet-light);
      text-decoration-thickness: 1.5px;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .badge {
      position: absolute;
      top: -12px;
      left: var(--sp-5);
      background: var(--gradient-ember);
      color: #fff6ef;
      font-family: var(--font-mono);
      font-size: 0.62rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: var(--r-pill);
    }
    .tag {
      font-family: var(--font-mono);
      font-size: 0.66rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }
    h3 {
      font-size: var(--fs-display-s);
      margin-top: var(--sp-2);
    }
    .price {
      font-family: var(--font-mono);
      font-size: 1.7rem;
      font-variant-numeric: tabular-nums;
      margin-top: var(--sp-4);
    }
    .note {
      display: block;
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: var(--text-quiet-light);
      margin-top: var(--sp-1);
    }
    ul {
      list-style: none;
      margin: var(--sp-5) 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    li {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      font-size: 0.9rem;
      padding-block: var(--sp-3);
      border-top: 1px solid var(--rule-on-light);
    }
    li:first-child {
      border-top: none;
    }
    .description {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-quiet-light);
      margin: var(--sp-5) 0 0;
    }
    .cta {
      display: block;
      margin-top: var(--sp-5);
    }
  `,
})
export class LevelCard {
  readonly level = input.required<Level>();
  readonly booked = output<void>();
  readonly unlockRequested = output<void>();
}
