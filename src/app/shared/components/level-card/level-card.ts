import { Component, input } from '@angular/core';
import { EvidenceTick } from '../evidence-tick/evidence-tick';

export interface Level {
  readonly tag: string;
  readonly name: string;
  readonly price: string;
  readonly priceNote?: string;
  readonly features: readonly string[];
  readonly recommended?: boolean;
}

@Component({
  selector: 'app-level-card',
  imports: [EvidenceTick],
  template: `
    <article class="level" [class.recommended]="level().recommended">
      @if (level().recommended) {
        <span class="badge">Most recommended</span>
      }
      <span class="tag">{{ level().tag }}</span>
      <h3>{{ level().name }}</h3>
      <p class="price">
        {{ level().price }}
        @if (level().priceNote; as note) {
          <span class="note">{{ note }}</span>
        }
      </p>
      <ul>
        @for (feature of level().features; track feature) {
          <li>
            <app-evidence-tick />
            {{ feature }}
          </li>
        }
      </ul>
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
  `,
})
export class LevelCard {
  readonly level = input.required<Level>();
}
