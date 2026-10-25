import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../api/api-client';
import type { BookingCreated, BookingDetail, BookingList, CreateBookingRequest } from '../api/api-types';
import type { ListTab } from '../booking/booking-list';

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

  /**
   * GET /v1/bookings?status=active|past&limit=20&cursor=...: one page of My Bookings, newest first. `cursor` is the
   * previous page's `nextCursor`, passed back untouched (it is opaque: never build or edit one).
   */
  list(tab: ListTab, cursor: string | null = null, limit = 20): Observable<BookingList> {
    return this.api.get<BookingList>('/v1/bookings', { params: { status: tab, limit, ...(cursor ? { cursor } : {}) } });
  }

  /** GET /v1/bookings/{reference}: the person's own booking (anyone else's is a 404 BOOKING_NOT_FOUND). */
  get(reference: string): Observable<BookingDetail> {
    return this.api
      .get<{ booking: BookingDetail }>(`/v1/bookings/${encodeURIComponent(reference)}`)
      .pipe(map((response) => response.booking));
  }
}
