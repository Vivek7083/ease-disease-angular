import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiError, toApiError } from './api-error';

const failure = (status: number, error: unknown, headers: Record<string, string> = {}) =>
  new HttpErrorResponse({ status, statusText: 'x', error, headers: new HttpHeaders(headers), url: '/v1/test' });

const apiBody = (code: string, details: Record<string, unknown> = {}, requestId = 'req-1') => ({
  error: { code, message: 'human text', details, requestId },
});

describe('toApiError', () => {
  it('reads code, message, details and requestId from the API error body', () => {
    const error = toApiError(failure(404, apiBody('BOOKING_NOT_FOUND')));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('BOOKING_NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.requestId).toBe('req-1');
    expect(error.message).toBe('human text');
  });

  it('maps a request that never got an answer (status 0) to NETWORK', () => {
    const error = toApiError(failure(0, new ProgressEvent('error')));
    expect(error.code).toBe('NETWORK');
    expect(error.status).toBe(0);
  });

  it('exposes per-field messages of VALIDATION_FAILED and ignores non-string values', () => {
    const error = toApiError(
      failure(400, apiBody('VALIDATION_FAILED', { fields: { whatsappNumber: 'Include the country code', age: 5 } })),
    );
    expect(error.fieldErrors).toEqual({ whatsappNumber: 'Include the country code' });
  });

  it('has no field errors for other codes', () => {
    expect(toApiError(failure(409, apiBody('DAILY_BOOKING_LIMIT'))).fieldErrors).toBeNull();
  });

  it('takes retryAfterSeconds from details on a 429', () => {
    const error = toApiError(failure(429, apiBody('RATE_LIMITED', { retryAfterSeconds: 42 })));
    expect(error.retryAfterSeconds).toBe(42);
  });

  it('falls back to the Retry-After header', () => {
    const error = toApiError(failure(429, apiBody('RATE_LIMITED'), { 'Retry-After': '30' }));
    expect(error.retryAfterSeconds).toBe(30);
  });

  it('falls back to the X-Request-Id header when the body has none', () => {
    const error = toApiError(failure(500, { error: { code: 'INTERNAL', message: 'm', details: {} } }, { 'X-Request-Id': 'hdr-9' }));
    expect(error.requestId).toBe('hdr-9');
  });

  it('maps a body that is not the API error shape (a gateway page) to UNKNOWN, keeping the status', () => {
    const error = toApiError(failure(502, '<html>Bad gateway</html>'));
    expect(error.code).toBe('UNKNOWN');
    expect(error.status).toBe(502);
    expect(error.fieldErrors).toBeNull();
  });
});
