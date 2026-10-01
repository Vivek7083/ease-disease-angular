import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CtaPill } from '../cta-pill/cta-pill';

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly credential: string;
  readonly bio: string;
  readonly initials: string;
  readonly ctaLabel: string;
  /** Left unset until a real photo is supplied — the portrait falls back to the initials badge. */
  readonly photo?: string;
}

@Component({
  selector: 'app-team-card',
  imports: [NgOptimizedImage, CtaPill],
  template: `
    <article class="team-card" [class.is-split]="split()">
      <div class="portrait">
        @if (member().photo; as photo) {
          <img [ngSrc]="photo" fill alt="" />
        } @else {
          <span class="portrait-fallback" aria-hidden="true">{{ member().initials }}</span>
        }
      </div>
      <div class="info">
        <h3>{{ member().name }}</h3>
        <p class="role">{{ member().role }}</p>
        <p class="credential">{{ member().credential }}</p>
        <p class="bio">{{ member().bio }}</p>
        <app-cta-pill class="cta" [label]="member().ctaLabel" variant="ghostLight" (pressed)="connectRequested.emit()" />
      </div>
    </article>
  `,
  styles: `
    .team-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background: var(--surface-deep);
      color: var(--ivory);
      border-radius: var(--r-lg);
      padding: var(--sp-8) var(--sp-6) var(--sp-6);
      box-shadow: var(--shadow-lift);
    }

    .portrait {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--gradient-ember);
    }

    .portrait img {
      object-fit: cover;
    }

    .portrait-fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff6ef;
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 600;
    }

    .info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h3 {
      margin-top: var(--sp-5);
      font-size: var(--fs-display-s);
      color: var(--ivory);
    }

    .role {
      margin-top: var(--sp-1);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--honey);
    }

    .credential {
      margin-top: var(--sp-2);
      font-size: 0.82rem;
      color: var(--text-quiet-dark);
    }

    .bio {
      margin-top: var(--sp-4);
      color: var(--text-quiet-dark);
      font-size: 0.9rem;
      line-height: var(--lh-body);
      max-width: 32ch;
    }

    .cta {
      margin-top: var(--sp-6);
    }

    /* Split layout: photo and info sit side by side instead of stacked —
       used for the large-screen spotlight, where there's width to spare and
       centering everything would waste it. */
    .team-card.is-split {
      flex-direction: row;
      align-items: center;
      text-align: left;
      gap: var(--sp-10);
      padding: var(--sp-10);
    }
    .team-card.is-split .portrait {
      flex: none;
      width: 220px;
      height: 220px;
    }
    .team-card.is-split .portrait-fallback {
      font-size: 3.2rem;
    }
    .team-card.is-split .info {
      align-items: flex-start;
      flex: 1;
    }
    .team-card.is-split h3 {
      margin-top: 0;
      font-size: var(--fs-display-m);
    }
    .team-card.is-split .bio {
      max-width: 48ch;
    }
  `,
})
export class TeamCard {
  readonly member = input.required<TeamMember>();
  readonly split = input(false);
  readonly connectRequested = output<void>();
}
