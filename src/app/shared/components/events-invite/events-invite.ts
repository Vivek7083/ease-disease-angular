import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

/** Home-page call-out that sends visitors to /events. */
@Component({
  selector: 'app-events-invite',
  imports: [RouterLink, ScrollRevealDirective, EyebrowLabel],
  template: `
    <div class="invite reveal" [appScrollReveal]="0">
      <svg class="invite-tickets" viewBox="0 0 220 150" aria-hidden="true" focusable="false">
        <g class="ticket-back" transform="rotate(7 110 75)">
          <rect x="34" y="28" width="150" height="86" rx="10" />
          <path class="perf" d="M126 28v86" />
        </g>
        <g class="ticket-front" transform="rotate(-6 110 75)">
          <rect x="30" y="32" width="150" height="86" rx="10" />
          <path class="perf" d="M122 32v86" />
          <circle class="notch" cx="122" cy="32" r="7" />
          <circle class="notch" cx="122" cy="118" r="7" />
          <rect class="line" x="46" y="56" width="58" height="6" rx="3" />
          <rect class="line line-short" x="46" y="72" width="40" height="6" rx="3" />
          <rect class="line line-short" x="46" y="88" width="48" height="6" rx="3" />
          <circle class="seal" cx="151" cy="75" r="14" />
          <path class="seal-mark" d="M151 66l2.6 6 6.4.4-4.9 4.1 1.6 6.3-5.7-3.4-5.7 3.4 1.6-6.3-4.9-4.1 6.4-.4z" />
        </g>
      </svg>

      <div class="invite-copy">
        <app-eyebrow-label text="Events & retreats" />
        <h2 id="events-invite-heading" class="t-display">Come gather with us.</h2>
        <p class="t-body invite-lede">
          Talks, workshops and retreats on gut health and whole-person healing - see what is coming and what we have hosted.
        </p>
        <a routerLink="/events" class="invite-cta">
          <span>Explore events &amp; retreats</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6" /></svg>
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .invite {
      display: grid;
      gap: var(--sp-6);
      align-items: center;
      padding: var(--sp-8) var(--sp-6);
      background:
        radial-gradient(120% 140% at 100% 0%, color-mix(in oklab, var(--honey) 22%, transparent), transparent 60%),
        var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      border-radius: var(--r-xl);
      box-shadow: var(--shadow-soft);
    }

    @media (min-width: 800px) {
      .invite {
        grid-template-columns: 1fr minmax(200px, 280px);
        gap: var(--sp-10);
        padding: var(--sp-10) var(--sp-12);
      }

      .invite-tickets {
        order: 2;
      }
    }

    .invite-tickets {
      width: min(220px, 70%);
      height: auto;
      margin-inline: auto;
      overflow: visible;
    }

    .ticket-back rect {
      fill: color-mix(in oklab, var(--terracotta) 22%, var(--parchment));
      stroke: var(--terracotta);
      stroke-width: 1.5;
    }

    .ticket-front rect:first-child {
      fill: var(--parchment);
      stroke: var(--oxblood);
      stroke-width: 1.5;
    }

    .perf {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 1.4;
      stroke-dasharray: 3 4;
      opacity: 0.55;
    }

    .ticket-back .perf {
      stroke: var(--terracotta);
    }

    .notch {
      fill: var(--ivory);
      stroke: var(--oxblood);
      stroke-width: 1.5;
    }

    .line {
      fill: var(--oxblood);
      opacity: 0.8;
    }

    .line-short {
      opacity: 0.4;
    }

    .seal {
      fill: var(--oxblood);
    }

    .seal-mark {
      fill: var(--honey);
    }

    .invite-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--sp-3);
    }

    .invite-copy h2 {
      font-size: var(--fs-display-m);
    }

    .invite-lede {
      max-width: 46ch;
      color: var(--text-quiet-light);
    }

    .invite-cta {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      min-height: var(--tap-min);
      margin-top: var(--sp-3);
      padding: 0 var(--sp-6);
      border-radius: var(--r-pill);
      background: var(--gradient-ember);
      color: #fff6ef;
      font-weight: 500;
      text-decoration: none;
      box-shadow: var(--shadow-soft);
      transition: transform var(--dur-micro) var(--ease);
    }

    .invite-cta:hover {
      transform: translateY(-1px);
    }

    .invite-cta svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform var(--dur-micro) var(--ease);
    }

    .invite-cta:hover svg {
      transform: translateX(3px);
    }
  `,
})
export class EventsInvite {}
