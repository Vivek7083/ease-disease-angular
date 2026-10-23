import { ApiError } from './api-error';
import { describeError } from './error-messages';

describe('describeError', () => {
  it('has a plain sentence for known API codes', () => {
    expect(describeError(new ApiError('DAILY_BOOKING_LIMIT', 'm', 409, 'r'))).toContain('try again tomorrow');
    expect(describeError(new ApiError('NETWORK', 'm', 0, null))).toBe('Check your connection and try again.');
  });

  it('says how long to wait on a rate limit', () => {
    expect(describeError(new ApiError('RATE_LIMITED', 'm', 429, 'r', {}, 42))).toContain('42 seconds');
  });

  it('shows the request id on an unexpected failure so support can find it', () => {
    expect(describeError(new ApiError('INTERNAL', 'm', 500, 'req-9'))).toContain('req-9');
  });

  it('says nothing when the person closed the sign-in window on purpose', () => {
    expect(describeError({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(describeError({ code: 'auth/cancelled-popup-request' })).toBeNull();
  });

  it('explains Firebase sign-in problems', () => {
    expect(describeError({ code: 'auth/popup-blocked' })).toContain('pop-ups');
    expect(describeError({ code: 'auth/expired-action-code' })).toContain('request a new one');
    expect(describeError({ code: 'auth/something-new' })).toBe('We could not sign you in. Please try again.');
  });

  it('falls back to a generic sentence for anything else', () => {
    expect(describeError(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });
});
