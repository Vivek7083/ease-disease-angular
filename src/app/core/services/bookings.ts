import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../api/api-client';
import type { BookingCreated, CreateBookingRequest } from '../api/api-types';

/** Bookings API calls. Errors arrive as ApiError (see api-error.interceptor.ts). */
@Service()
export class BookingsService {
  private readonly api = inject(ApiClient);

  /** POST /v1/bookings. `idempotencyKey` comes from AttemptKey: the same request keeps its key across retries. */
  create(request: CreateBookingRequest, idempotencyKey: string): Observable<BookingCreated> {
    return this.api
      .post<{ booking: BookingCreated }>('/v1/bookings', request, { headers: { 'Idempotency-Key': idempotencyKey } })
      .pipe(map((response) => response.booking));
  }
}
