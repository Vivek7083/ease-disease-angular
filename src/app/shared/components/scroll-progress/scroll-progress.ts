import { Component, DestroyRef, inject, signal } from '@angular/core';

/**
 * Replaces the hamburger/menu-dot pattern with something that actually fits a
 * one-page scrollytelling site: a slim rail on the edge of the screen that
 * fills as the reader moves through the story, instead of a nav that has
 * nowhere to point yet.
 */
@Component({
  selector: 'app-scroll-progress',
  template: `
    <div class="rail" aria-hidden="true">
      <div class="rail-track">
        <div class="rail-fill" [style.height.%]="progress() * 100"></div>
      </div>
      <span class="rail-mark">{{ percentLabel() }}</span>
    </div>
  `,
  styles: `
    .rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-2);
    }
    .rail-track {
      width: 2px;
      height: 88px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--ink) 14%, transparent);
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }
    .rail-fill {
      width: 100%;
      background: var(--oxblood);
      transition: height var(--dur-micro) linear;
    }
    .rail-mark {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      letter-spacing: 0.04em;
      color: var(--text-quiet-light);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class ScrollProgress {
  private readonly destroyRef = inject(DestroyRef);
  private ticking = false;

  readonly progress = signal(0);
  readonly percentLabel = () => `${Math.round(this.progress() * 100)}`;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const onScroll = () => {
      if (this.ticking) {
        return;
      }
      this.ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        this.progress.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
        this.ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });
  }
}
