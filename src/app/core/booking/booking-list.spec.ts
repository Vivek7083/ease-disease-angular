import type { BookingStatus } from '../api/api-types';
import { statusLabel } from './booking-list';

describe('statusLabel', () => {
  it('says awaiting payment when the person can still pay, and payment processing when a payment is in progress', () => {
    expect(statusLabel({ status: 'PENDING_PAYMENT', canPay: true })).toEqual({ text: 'Awaiting payment', tone: 'wait' });
    expect(statusLabel({ status: 'PENDING_PAYMENT', canPay: false })).toEqual({ text: 'Payment processing', tone: 'wait' });
  });

  it('has a label and a tone for every status', () => {
    const expected: Record<Exclude<BookingStatus, 'PENDING_PAYMENT'>, [string, string]> = {
      CONFIRMED: ['Confirmed', 'good'],
      COMPLETED: ['Completed', 'good'],
      NEEDS_ATTENTION: ['We are checking one detail', 'wait'],
      FAILED: ['Payment failed', 'bad'],
      CANCELLED: ['Cancelled', 'bad'],
      EXPIRED: ['Expired', 'bad'],
      NO_SHOW: ['Missed', 'bad'],
    };
    for (const [status, [text, tone]] of Object.entries(expected)) {
      expect(statusLabel({ status: status as BookingStatus, canPay: false }), status).toEqual({ text, tone });
    }
  });
});
