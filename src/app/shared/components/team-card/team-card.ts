import { Component, input } from '@angular/core';

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly initials: string;
}

@Component({
  selector: 'app-team-card',
  template: `
    <article class="team-card">
      <div class="portrait" aria-hidden="true">{{ member().initials }}</div>
      <h3>{{ member().name }}</h3>
      <p class="role">{{ member().role }}</p>
      <p class="bio">{{ member().bio }}</p>
    </article>
  `,
  styles: `
    .team-card {
      background: var(--surface-deep);
      color: var(--ivory);
      border-radius: var(--r-lg);
      padding: var(--sp-6);
      box-shadow: var(--shadow-lift);
    }
    .portrait {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--gradient-ember);
      color: #fff6ef;
      font-family: var(--font-display);
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
    .bio {
      margin-top: var(--sp-4);
      color: var(--text-quiet-dark);
      font-size: 0.9rem;
      line-height: var(--lh-body);
    }
  `,
})
export class TeamCard {
  readonly member = input.required<TeamMember>();
}
