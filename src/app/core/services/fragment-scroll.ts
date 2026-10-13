import { DestroyRef, Service, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const SETTLE_TIMEOUT_MS = 2000;
const STABLE_FRAMES = 20;

/**
 * Scrolls to a route's #fragment once the target exists and the page has
 * stopped shifting. Angular's built-in anchor scrolling fires right after
 * navigation, before a lazy-loaded page has its final layout (pinned scroll
 * tracks, images), so it either misses the section or lands short of it.
 */
@Service()
export class FragmentScrollService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  start(destroyRef: DestroyRef): void {
    const sub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
        if (fragment) {
          this.scrollWhenSettled(fragment);
        }
      });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private scrollWhenSettled(id: string): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const userEvents = ['wheel', 'touchstart', 'keydown'] as const;
    userEvents.forEach((name) => win.addEventListener(name, cancel, { once: true, passive: true }));

    const deadline = win.performance.now() + SETTLE_TIMEOUT_MS;
    let stableFrames = 0;

    const tick = () => {
      const target = this.document.getElementById(id);
      if (target) {
        const top = target.getBoundingClientRect().top + win.scrollY;
        if (Math.abs(win.scrollY - top) > 1) {
          win.scrollTo({ top, behavior: 'instant' });
          stableFrames = 0;
        } else {
          stableFrames++;
        }
      }

      if (!cancelled && stableFrames < STABLE_FRAMES && win.performance.now() < deadline) {
        win.requestAnimationFrame(tick);
      } else {
        userEvents.forEach((name) => win.removeEventListener(name, cancel));
      }
    };
    win.requestAnimationFrame(tick);
  }
}
