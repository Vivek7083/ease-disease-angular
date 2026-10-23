import { Service, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../api/api-client';
import type { PackageItem } from '../api/api-types';
import { MAIN_PLAN, type Plan } from '../config/booking';

/** `₹` plus whole rupees, or two decimals when the price has paise. Format only; the API deals in paise. */
export const formatRupees = (paise: number): string => `₹${(paise / 100).toFixed(paise % 100 === 0 ? 0 : 2)}`;

/**
 * The bookable package, from GET /v1/packages (public, cached by the browser
 * for 5 minutes). Loaded once at start-up. Until it arrives, and if it cannot
 * be loaded, everything reads the fallback copy in MAIN_PLAN, so a CTA always
 * has a price to show. The price a person is charged is always the server's:
 * the client never sends a price.
 */
@Service()
export class PackagesService {
  private readonly api = inject(ApiClient);

  /** The launch package from the API, or null before it loads / if loading failed. */
  readonly mainPackage = signal<PackageItem | null>(null);

  /** The id to book: the API's package, else the launch package id from the environment. */
  readonly packageId = computed(() => this.mainPackage()?.id ?? environment.launchPackageId);

  /** What the CTAs show: the API's price and duration, else the fallback copy. */
  readonly plan = computed<Plan>(() => {
    const pkg = this.mainPackage();
    return pkg
      ? { ...MAIN_PLAN, duration: `${pkg.durationMinutes} min`, price: formatRupees(pkg.pricePaise) }
      : MAIN_PLAN;
  });

  /** Minutes as words for longer copy, e.g. "30 minutes". */
  readonly durationWords = computed(() => {
    const pkg = this.mainPackage();
    return pkg ? `${pkg.durationMinutes} minutes` : '30 minutes';
  });

  private started = false;

  /** Fetches the package list once. A failure keeps the fallback copy; it is not shown to the visitor. */
  load(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.api.get<{ packages: PackageItem[] }>('/v1/packages').subscribe({
      next: ({ packages }) => this.mainPackage.set(packages.find((p) => p.currency === 'INR') ?? null),
      error: () => this.mainPackage.set(null),
    });
  }
}
