import { Component, input } from '@angular/core';

export type SocialPlatform = 'linkedin' | 'instagram' | 'facebook' | 'youtube';

export interface SocialLink {
  readonly platform: SocialPlatform;
  /** Omitted while the real URL isn't available yet - renders as a disabled "coming soon" item instead of a dead link. */
  readonly url?: string;
}

const LABELS: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

@Component({
  selector: 'app-social-links',
  template: `
    <ul class="social-links">
      @for (link of links(); track link.platform) {
        <li>
          @if (link.url; as url) {
            <a [href]="url" target="_blank" rel="noopener noreferrer" class="social-link" [attr.aria-label]="LABELS[link.platform]">
              @switch (link.platform) {
                @case ('linkedin') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"
                    />
                  </svg>
                }
                @case ('instagram') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                }
                @case ('facebook') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 8.5h2V5.1c-.35-.05-1.54-.15-2.94-.15-2.9 0-4.9 1.78-4.9 5.04V13H6.5v3.8h2.66V23h3.73v-6.2h2.78l.44-3.8h-3.22v-2.6c0-1.1.3-1.9 1.91-1.9Z" />
                  </svg>
                }
                @case ('youtube') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                    <path d="M10.3 9.3v5.4l4.8-2.7-4.8-2.7Z" fill="currentColor" stroke="none" />
                  </svg>
                }
              }
            </a>
          } @else {
            <span class="social-link social-link-pending" [attr.aria-label]="LABELS[link.platform] + ' - coming soon'">
              @switch (link.platform) {
                @case ('linkedin') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"
                    />
                  </svg>
                }
                @case ('instagram') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                }
                @case ('facebook') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 8.5h2V5.1c-.35-.05-1.54-.15-2.94-.15-2.9 0-4.9 1.78-4.9 5.04V13H6.5v3.8h2.66V23h3.73v-6.2h2.78l.44-3.8h-3.22v-2.6c0-1.1.3-1.9 1.91-1.9Z" />
                  </svg>
                }
                @case ('youtube') {
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                    <path d="M10.3 9.3v5.4l4.8-2.7-4.8-2.7Z" fill="currentColor" stroke="none" />
                  </svg>
                }
              }
              <span class="social-link-soon">Soon</span>
            </span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .social-links {
      display: inline-flex;
      gap: var(--sp-3);
      list-style: none;
      padding: 0;
      margin-top: var(--sp-5);
    }
    .social-link {
      position: relative;
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid var(--rule-on-light);
      background: var(--surface-card-light);
      color: #000;
      transition:
        background var(--dur-micro) var(--ease),
        border-color var(--dur-micro) var(--ease);
    }
    a.social-link:hover,
    a.social-link:focus-visible {
      border-color: var(--oxblood);
      background: color-mix(in oklab, var(--honey) 14%, var(--surface-card-light));
    }
    a.social-link:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .social-link svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
    }
    svg path {
      fill: currentColor;
      stroke: none;
    }
    .social-link-pending {
      cursor: default;
      color: var(--text-quiet-light);
      opacity: 0.55;
    }
    .social-link-soon {
      position: absolute;
      bottom: -18px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      white-space: nowrap;
    }
  `,
})
export class SocialLinks {
  readonly links = input.required<readonly SocialLink[]>();
  protected readonly LABELS = LABELS;
}
