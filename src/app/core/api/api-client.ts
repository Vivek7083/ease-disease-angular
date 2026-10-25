import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  /** Extra headers, e.g. `Idempotency-Key`. */
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number>;
}

/**
 * Thin typed wrapper over HttpClient that prefixes the API origin. Failures
 * arrive as ApiError (see api-error.interceptor.ts). Bearer token and App Check
 * headers are added by their own interceptors (FE-2, FE-8), not here.
 */
@Service()
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(path), this.init(options));
  }

  post<T>(path: string, body: unknown = null, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body, this.init(options));
  }

  /** A fresh key for `Idempotency-Key`. Keep it for retries of the identical request; make a new one for any change. */
  idempotencyKey(): string {
    return crypto.randomUUID();
  }

  private url(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }

  private init(options: ApiRequestOptions) {
    return { headers: new HttpHeaders(options.headers ?? {}), params: options.params };
  }
}
