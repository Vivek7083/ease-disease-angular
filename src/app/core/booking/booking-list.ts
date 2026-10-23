import type { BookingListItem } from '../api/api-types';

/** Which tab a booking list belongs to. `active` = waiting, confirmed or held; `past` = everything else (api-flow.md). */
export type ListTab = 'active' | 'past';

/** How a list row's status is styled: good news, still moving, or something that did not happen. */
export type StatusTone = 'good' | 'wait' | 'bad';

export interface StatusLabel {
  readonly text: string;
  readonly tone: StatusTone;
}

/**
 * The words for a booking's status in My Bookings. A booking that is still PENDING_PAYMENT is either waiting for the
 * person to pay (`canPay`) or has a payment in progress that we are waiting to hear about.
 */
export function statusLabel(item: Pick<BookingListItem, 'status' | 'canPay'>): StatusLabel {
  switch (item.status) {
    case 'PENDING_PAYMENT':
      return item.canPay ? { text: 'Awaiting payment', tone: 'wait' } : { text: 'Payment processing', tone: 'wait' };
    case 'CONFIRMED':
      return { text: 'Confirmed', tone: 'good' };
    case 'COMPLETED':
      return { text: 'Completed', tone: 'good' };
    case 'NEEDS_ATTENTION':
      return { text: 'We are checking one detail', tone: 'wait' };
    case 'FAILED':
      return { text: 'Payment failed', tone: 'bad' };
    case 'CANCELLED':
      return { text: 'Cancelled', tone: 'bad' };
    case 'EXPIRED':
      return { text: 'Expired', tone: 'bad' };
    case 'NO_SHOW':
      return { text: 'Missed', tone: 'bad' };
  }
}
