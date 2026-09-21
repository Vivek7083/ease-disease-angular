import { Component, input } from '@angular/core';

export type Tone = 'light' | 'dark';

@Component({
  selector: 'app-eyebrow-label',
  template: `
    <div class="eyebrow" [class.dark]="tone() === 'dark'">
      @if (count(); as c) {
        <span class="count">{{ c }}</span>
      }
      <span class="rule" aria-hidden="true"></span>
      <span class="text">{{ text() }}</span>
    </div>
  `,
  styles: `
    .eyebrow {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      color: var(--text-quiet-light);
    }
    .eyebrow.dark {
      color: var(--text-quiet-dark);
    }
    .count,
    .text {
      font-family: var(--font-mono);
      font-size: var(--fs-eyebrow);
      letter-spacing: var(--ls-eyebrow);
      line-height: var(--lh-eyebrow);
    }
    .text {
      text-transform: uppercase;
    }
    .rule {
      width: 28px;
      height: 1px;
      background: var(--rule-on-light);
      flex: none;
    }
    .eyebrow.dark .rule {
      background: var(--rule-on-dark);
    }
  `,
})
export class EyebrowLabel {
  readonly text = input.required<string>();
  readonly count = input<string | undefined>(undefined);
  readonly tone = input<Tone>('light');
}
