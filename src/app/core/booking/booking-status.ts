import type { BookingDetail } from '../api/api-types';

/** What the status page shows. One per situation the person can be in. */
export type StatusView =
  | 'unpaid'
  | 'confirming'
  | 'still-confirming'
  | 'confirmed'
  | 'failed'
  | 'attention'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'no-show';

/**
 * True when polling can stop: the booking has left PENDING_PAYMENT, or its payment was refused or cancelled.
 * A payment of SUCCESS while the booking still says PENDING_PAYMENT is NOT final: the backend confirms the booking
 * in the same step, so that is a moment of catching up and the next poll shows CONFIRMED.
 */
export function isFinal(booking: BookingDetail): boolean {
  if (booking.status !== 'PENDING_PAYMENT') {
    return true;
  }
  return booking.payment !== null && (booking.payment.status === 'FAILURE' || booking.payment.status === 'CANCELLED');
}

/** The status page's view of a booking. `timedOut` is true once the 60 second poll window ended while it was still pending. */
export function viewOf(booking: BookingDetail, timedOut: boolean): StatusView {
  switch (booking.status) {
    case 'CONFIRMED':
      return 'confirmed';
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
      return 'failed';
    case 'NEEDS_ATTENTION':
      return 'attention';
    case 'CANCELLED':
      return 'cancelled';
    case 'EXPIRED':
      return 'expired';
    case 'NO_SHOW':
      return 'no-show';
    case 'PENDING_PAYMENT':
      if (booking.payment === null) {
        return 'unpaid';
      }
      if (booking.payment.status === 'FAILURE' || booking.payment.status === 'CANCELLED') {
        return 'failed';
      }
      return timedOut ? 'still-confirming' : 'confirming';
  }
}

/** A short notice for the `?e=` flag the payment callback may add to the address. Nothing in the address is trusted for anything else. */
export function noticeFor(flag: string | undefined): string | null {
  switch (flag) {
    case 'verify':
      return 'We could not verify the payment response automatically. We are checking with the bank.';
    case 'busy':
      return 'We were busy when you came back. We are still checking.';
    case 'server':
      return 'We hit a problem when you came back. We are still checking.';
    default:
      return null;
  }
}

const IST = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

/** An ISO timestamp as India time, e.g. "24 Oct 2026, 1:13 am". */
export function formatIst(iso: string): string {
  return IST.format(new Date(iso));
}
