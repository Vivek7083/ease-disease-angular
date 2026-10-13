import { DestroyRef, Service, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SwUpdate, type VersionEvent, type VersionReadyEvent } from '@angular/service-worker';
import { filter, fromEvent } from 'rxjs';

/**
 * The Angular service worker serves the cached app first and only fetches a
 * new deploy in the background, so without this a visitor needs several
 * refreshes to see a release. This activates the new version and reloads the
 * moment it is ready, and re-checks whenever the tab regains focus.
 */
@Service()
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);

  start(destroyRef: DestroyRef): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    const ready = this.swUpdate.versionUpdates
      .pipe(filter((event: VersionEvent): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(async () => {
        await this.swUpdate.activateUpdate();
        this.document.location.reload();
      });

    const visible = fromEvent(this.document, 'visibilitychange')
      .pipe(filter(() => this.document.visibilityState === 'visible'))
      .subscribe(() => void this.swUpdate.checkForUpdate().catch(() => undefined));

    destroyRef.onDestroy(() => {
      ready.unsubscribe();
      visible.unsubscribe();
    });
  }
}
