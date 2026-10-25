import { ApiError } from './api-error';

const GENERIC = 'Something went wrong. Please try again.';
const NETWORK = 'Check your connection and try again.';
const SIGN_IN_UNAVAILABLE = 'Sign-in is temporarily unavailable. Please try again in a moment.';

/** What to tell the person for each API error code (api-flow.md section 7). Branch on `code`, never on the server's message. */
const API_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Please check the highlighted fields.',
  UNAUTHENTICATED: 'Your session ended. Please sign in again.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address with your sign-in provider, then sign in again.',
  UNSUPPORTED_SIGN_IN_PROVIDER: 'Please sign in with Google or an email link.',
  APP_CHECK_FAILED: 'We could not verify this browser. Please reload the page and try again.',
  BOOKING_NOT_FOUND: 'We cannot find this booking.',
  PACKAGE_NOT_FOUND: 'This consultation is not available right now.',
  PACKAGE_NOT_ACTIVE: 'This consultation is not available right now.',
  TOO_MANY_PENDING_BOOKINGS: 'You have unpaid bookings. Pay for one, or wait for them to expire.',
  DAILY_BOOKING_LIMIT: 'Today’s booking limit has been reached. Please try again tomorrow.',
  BOOKING_NOT_PAYABLE: 'This booking cannot be paid right now.',
  PAYMENT_PHONE_UNSUPPORTED: 'We cannot take payment for this phone number online yet. Please contact us.',
  IDEMPOTENCY_CONFLICT: 'That request did not go through. Please try again.',
  PAYMENT_GATEWAY_UNAVAILABLE: 'Payments are temporarily unavailable. Please try again shortly.',
  AUTH_UNAVAILABLE: SIGN_IN_UNAVAILABLE,
  APP_CHECK_UNAVAILABLE: SIGN_IN_UNAVAILABLE,
  NETWORK,
};

/** Firebase Auth error codes worth a specific sentence. A `null` entry means "the person did this on purpose, say nothing". */
const FIREBASE_MESSAGES: Record<string, string | null> = {
  'auth/popup-closed-by-user': null,
  'auth/cancelled-popup-request': null,
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': NETWORK,
  'auth/invalid-action-code': 'This sign-in link has expired or was already used. Please request a new one.',
  'auth/expired-action-code': 'This sign-in link has expired or was already used. Please request a new one.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact us.',
};

const firebaseCode = (error: unknown): string | null => {
  const code = typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined;
  return typeof code === 'string' && code.startsWith('auth/') ? code : null;
};

/**
 * One sentence for any failure from the API or from Firebase sign-in, or null
 * when nothing should be shown (the person closed the sign-in window). Generic
 * failures carry the request id so support can find the server log line.
 */
export function describeError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return error.retryAfterSeconds
        ? `Too many attempts. Please wait ${error.retryAfterSeconds} seconds and try again.`
        : 'Too many attempts. Please wait a moment and try again.';
    }
    const known = API_MESSAGES[error.code];
    if (known) {
      return known;
    }
    return error.requestId ? `${GENERIC} (reference ${error.requestId})` : GENERIC;
  }

  const code = firebaseCode(error);
  if (code && code in FIREBASE_MESSAGES) {
    return FIREBASE_MESSAGES[code] ?? null;
  }
  return code ? 'We could not sign you in. Please try again.' : GENERIC;
}
