import type { BookingDetail, BookingStatus, PaymentStatus } from '../api/api-types';
import { formatIst, isFinal, noticeFor, viewOf } from './booking-status';

const booking = (status: BookingStatus, payment: PaymentStatus | null = null): BookingDetail => ({
  reference: 'ED-7K3QXM',
  status,
  packageTitle: 'One-Time Consult',
  amountPaise: 249900,
  currency: 'INR',
  name: 'Priya Sharma',
  whatsappNumber: '+919876543210',
  email: 'priya@example.com',
  age: 34,
  city: 'Pune',
  gender: null,
  notes: null,
  canPay: false,
  payment: payment ? { orderId: 'EDTX1', status: payment, mode: null, paidAt: null } : null,
  createdAt: '2026-10-23T19:00:00.000Z',
});

describe('isFinal', () => {
  it('keeps polling while the booking waits for payment', () => {
    expect(isFinal(booking('PENDING_PAYMENT'))).toBe(false);
    expect(isFinal(booking('PENDING_PAYMENT', 'INITIATED'))).toBe(false);
    expect(isFinal(booking('PENDING_PAYMENT', 'PENDING'))).toBe(false);
  });

  it('stops once the booking has moved on, whatever the new status', () => {
    for (const status of ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED', 'NEEDS_ATTENTION', 'FAILED'] as const) {
      expect(isFinal(booking(status)), status).toBe(true);
    }
  });

  it('stops when the payment was refused or cancelled', () => {
    expect(isFinal(booking('PENDING_PAYMENT', 'FAILURE'))).toBe(true);
    expect(isFinal(booking('PENDING_PAYMENT', 'CANCELLED'))).toBe(true);
  });

  it('does not stop on a paid payment whose booking has not caught up yet', () => {
    expect(isFinal(booking('PENDING_PAYMENT', 'SUCCESS'))).toBe(false);
  });
});

describe('viewOf', () => {
  it('maps each booking status to its screen', () => {
    expect(viewOf(booking('CONFIRMED', 'SUCCESS'), false)).toBe('confirmed');
    expect(viewOf(booking('FAILED'), false)).toBe('failed');
    expect(viewOf(booking('NEEDS_ATTENTION'), false)).toBe('attention');
    expect(viewOf(booking('COMPLETED'), false)).toBe('completed');
    expect(viewOf(booking('CANCELLED'), false)).toBe('cancelled');
    expect(viewOf(booking('EXPIRED'), false)).toBe('expired');
    expect(viewOf(booking('NO_SHOW'), false)).toBe('no-show');
  });

  it('says confirming while a started payment is undecided, and still-confirming once the window ended', () => {
    expect(viewOf(booking('PENDING_PAYMENT', 'INITIATED'), false)).toBe('confirming');
    expect(viewOf(booking('PENDING_PAYMENT', 'INITIATED'), true)).toBe('still-confirming');
  });

  it('says unpaid, not confirming, when no payment was ever started', () => {
    expect(viewOf(booking('PENDING_PAYMENT'), false)).toBe('unpaid');
    expect(viewOf(booking('PENDING_PAYMENT'), true)).toBe('unpaid');
  });

  it('shows a refused or cancelled payment as failed even if the booking row has not changed yet', () => {
    expect(viewOf(booking('PENDING_PAYMENT', 'FAILURE'), false)).toBe('failed');
    expect(viewOf(booking('PENDING_PAYMENT', 'CANCELLED'), false)).toBe('failed');
  });
});

describe('noticeFor', () => {
  it('words the three flags the callback may add', () => {
    expect(noticeFor('verify')).toContain('could not verify');
    expect(noticeFor('busy')).toContain('busy');
    expect(noticeFor('server')).toContain('problem');
  });

  it('ignores anything else in the address', () => {
    expect(noticeFor(undefined)).toBeNull();
    expect(noticeFor('<script>')).toBeNull();
  });
});

describe('formatIst', () => {
  it('shows India time', () => {
    // 19:43 UTC is 1:13 am the next day in India (UTC+5:30).
    expect(formatIst('2026-10-23T19:43:39.094Z')).toMatch(/24 Oct 2026, 1:13\s?am/i);
  });
});
