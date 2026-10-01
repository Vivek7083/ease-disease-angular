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
    <article class="team-card">
      <div class="portrait">
        @if (member().photo; as photo) {
          <img [ngSrc]="photo" fill alt="" />
        } @else {
          <span class="portrait-fallback" aria-hidden="true">{{ member().initials }}</span>
        }
      </div>
      <h3>{{ member().name }}</h3>
      <p class="role">{{ member().role }}</p>
      <p class="credential">{{ member().credential }}</p>
      <p class="bio">{{ member().bio }}</p>
      <app-cta-pill class="cta" [label]="member().ctaLabel" variant="ghostLight" (pressed)="connectRequested.emit()" />
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
      padding: var(--sp-7) var(--sp-6) var(--sp-6);
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
  `,
})
export class TeamCard {
  readonly member = input.required<TeamMember>();
  readonly connectRequested = output<void>();
}
