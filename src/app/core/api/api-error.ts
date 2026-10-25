import { HttpErrorResponse } from '@angular/common/http';
import type { FieldErrors } from './api-types';

/** Codes the client invents (the API never sends them). Everything else is the API's own code. */
export type ClientErrorCode = 'NETWORK' | 'UNKNOWN';

/**
 * Every failed API call surfaces as one of these. Branch on `code`, never on
 * `message` (the message is for logs). `requestId` is what support needs to
 * find the server log line, so show it on "something went wrong" screens.
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    /** HTTP status; 0 when the request never got an answer. */
    readonly status: number,
    readonly requestId: string | null,
    readonly details: Record<string, unknown> = {},
    /** From `details.retryAfterSeconds` or the Retry-After header (429 answers). */
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Per-field messages of a VALIDATION_FAILED answer, keyed by API field name. */
  get fieldErrors(): FieldErrors | null {
    const fields = this.details['fields'];
    if (this.code !== 'VALIDATION_FAILED' || typeof fields !== 'object' || fields === null) {
      return null;
    }
    const result: FieldErrors = {};
    for (const [name, value] of Object.entries(fields)) {
      if (typeof value === 'string') {
        result[name] = value;
      }
    }
    return result;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const seconds = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.ceil(n) : null;
};

/** Turns a failed HTTP response into an ApiError, reading the API's `{ error: { code, message, details, requestId } }` body. */
export function toApiError(response: HttpErrorResponse): ApiError {
  const headerRequestId = response.headers?.get('X-Request-Id') ?? null;

  if (response.status === 0) {
    return new ApiError('NETWORK', 'The request could not reach the server.', 0, headerRequestId);
  }

  const body: unknown = response.error;
  const error = isRecord(body) ? body['error'] : undefined;
  if (!isRecord(error) || typeof error['code'] !== 'string') {
    // Not the API's own error body (a proxy or gateway page, an empty answer).
    return new ApiError('UNKNOWN', response.statusText || 'Unexpected response.', response.status, headerRequestId);
  }

  const details = isRecord(error['details']) ? error['details'] : {};
  const requestId = typeof error['requestId'] === 'string' ? error['requestId'] : headerRequestId;
  const retryAfter = seconds(details['retryAfterSeconds']) ?? seconds(response.headers?.get('Retry-After'));
  return new ApiError(
    error['code'],
    typeof error['message'] === 'string' ? error['message'] : '',
    response.status,
    requestId,
    details,
    retryAfter,
  );
}
