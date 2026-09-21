import { Component, computed, input } from '@angular/core';
import { EyebrowLabel, type Tone } from '../eyebrow-label/eyebrow-label';

export type DisplaySize = 'xl' | 'l' | 'm' | 's';
export type DisplayAlign = 'left' | 'center';

@Component({
  selector: 'app-display-block',
  imports: [EyebrowLabel],
  template: `
    <div class="display-block" [class.center]="align() === 'center'">
      @if (eyebrow(); as e) {
        <app-eyebrow-label [text]="e" [count]="count()" [tone]="tone()" />
      }
      <h2 class="headline" [class.dark]="tone() === 'dark'" [style.font-size]="fontSize()">
        @if (headlineParts(); as parts) {
          {{ parts.before }}<span class="highlight" [class.dark]="tone() === 'dark'">{{ parts.mark }}</span
          >{{ parts.after }}
        } @else {
          {{ headline() }}
        }
      </h2>
      @if (body(); as b) {
        <p class="body" [class.dark]="tone() === 'dark'">{{ b }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .display-block {
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
      align-items: flex-start;
      text-align: left;
    }
    .display-block.center {
      align-items: center;
      text-align: center;
    }
    .headline {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 400;
      line-height: var(--lh-display);
      letter-spacing: var(--ls-display);
      max-width: var(--measure-display);
      text-wrap: balance;
    }
    .headline.dark {
      color: var(--ivory);
    }
    .highlight {
      padding: 0 0.06em;
      background: linear-gradient(to top, var(--honey) 0 26%, transparent 26%);
    }
    .highlight.dark {
      background: linear-gradient(to top, var(--honey) 0 0.1em, transparent 0.1em);
    }
    .body {
      margin: 0;
      color: var(--text-quiet-light);
      font-family: var(--font-body);
      font-size: var(--fs-body-m);
      line-height: var(--lh-body);
      max-width: var(--measure-body);
      text-wrap: pretty;
    }
    .body.dark {
      color: var(--text-quiet-dark);
    }
  `,
})
export class DisplayBlock {
  readonly eyebrow = input<string | undefined>(undefined);
  readonly count = input<string | undefined>(undefined);
  readonly headline = input.required<string>();
  readonly highlight = input<string | undefined>(undefined);
  readonly body = input<string | undefined>(undefined);
  readonly tone = input<Tone>('dark');
  readonly size = input<DisplaySize>('l');
  readonly align = input<DisplayAlign>('left');

  private readonly sizeVar: Record<DisplaySize, string> = {
    xl: 'var(--fs-display-xl)',
    l: 'var(--fs-display-l)',
    m: 'var(--fs-display-m)',
    s: 'var(--fs-display-s)',
  };

  protected readonly fontSize = computed(() => this.sizeVar[this.size()]);

  protected readonly headlineParts = computed(() => {
    const mark = this.highlight();
    const headline = this.headline();
    if (!mark || !headline.includes(mark)) {
      return null;
    }
    const index = headline.indexOf(mark);
    return {
      before: headline.slice(0, index),
      mark,
      after: headline.slice(index + mark.length),
    };
  });
}
