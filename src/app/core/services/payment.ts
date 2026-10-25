import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { ApiError } from '../api/api-error';
import type { CheckoutForm } from '../api/api-types';
import { AttemptKey } from '../booking/attempt-key';

/**
 * Starts a payment: asks the API for the PayU form of a booking, then hands the browser over to PayU by posting that
 * form exactly as given. The form holds the payment hash, so it is used once and never stored or logged.
 */
@Service()
export class PaymentService {
  private readonly api = inject(ApiClient);
  private readonly document = inject(DOCUMENT);
  private readonly attemptKey = new AttemptKey(() => this.api.idempotencyKey());

  /**
   * Resolves only if the browser is on its way to PayU (the page is about to be replaced). Rejects with an ApiError
   * when the API refuses. The same booking keeps its Idempotency-Key across retries (the API stores only successful
   * answers, so a retry after a failure is safe); if the API says the key was used differently, one fresh key is tried.
   */
  async startPayment(reference: string): Promise<void> {
    let form: CheckoutForm;
    try {
      form = await firstValueFrom(this.checkout(reference));
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'IDEMPOTENCY_CONFLICT') {
        throw error;
      }
      this.attemptKey.renew();
      form = await firstValueFrom(this.checkout(reference));
    }
    this.attemptKey.renew();
    this.handOver(form);
  }

  /** POST /v1/bookings/{reference}/checkout (no body). */
  private checkout(reference: string): Observable<CheckoutForm> {
    return this.api.post<CheckoutForm>(`/v1/bookings/${encodeURIComponent(reference)}/checkout`, null, {
      headers: { 'Idempotency-Key': this.attemptKey.keyFor({ reference }) },
    });
  }

  /**
   * Builds a hidden POST form with one hidden input per field, in the order given, nothing added and nothing changed,
   * and submits it. The browser leaves the site. Refuses anything that is not an https POST form.
   */
  handOver(checkout: CheckoutForm): void {
    if (checkout.method !== 'POST' || new URL(checkout.gatewayUrl).protocol !== 'https:') {
      throw new Error('The payment form is not one this app will submit.');
    }
    const form = this.document.createElement('form');
    form.method = 'POST';
    form.action = checkout.gatewayUrl;
    form.acceptCharset = 'UTF-8';
    form.hidden = true;
    for (const [name, value] of Object.entries(checkout.fields)) {
      const input = this.document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    this.document.body.appendChild(form);
    form.submit();
  }
}
