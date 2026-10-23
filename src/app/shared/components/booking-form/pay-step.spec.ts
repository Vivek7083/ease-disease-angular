import { TestBed } from '@angular/core/testing';
import { ApiError } from '../../../core/api/api-error';
import type { BookingCreated } from '../../../core/api/api-types';
import { PaymentService } from '../../../core/services/payment';
import { PayStep } from './pay-step';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const BOOKING: BookingCreated = {
  reference: 'ED-7K3QXM',
  status: 'PENDING_PAYMENT',
  packageTitle: 'One-Time Consult',
  amountPaise: 249900,
  currency: 'INR',
  name: 'Priya Sharma',
  whatsappNumber: '+919876543210',
  email: 'priya@example.com',
  age: 34,
  city: 'Pune',
  gender: null,
  canPay: true,
  payment: null,
  createdAt: '2026-10-24T10:00:00.000Z',
};

class FakePayment {
  references: string[] = [];
  outcomes: (ApiError | 'leaves')[] = [];
  startPayment = async (reference: string) => {
    this.references.push(reference);
    const outcome = this.outcomes.shift() ?? 'leaves';
    if (outcome !== 'leaves') throw outcome;
  };
}

const fail = (code: string, status: number, retryAfter: number | null = null) => new ApiError(code, 'm', status, 'req-1', {}, retryAfter);

describe('PayStep', () => {
  let payment: FakePayment;

  const render = async () => {
    const fixture = TestBed.createComponent(PayStep);
    fixture.componentRef.setInput('booking', BOOKING);
    fixture.detectChanges();
    await settle();
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  };
  const text = (root: HTMLElement) => root.textContent?.replace(/\s+/g, ' ') ?? '';

  beforeEach(() => {
    payment = new FakePayment();
    TestBed.configureTestingModule({ providers: [{ provide: PaymentService, useValue: payment }] });
  });

  it('goes straight to payment for the booking just created, and says so while the browser leaves', async () => {
    const { root } = await render();
    expect(payment.references).toEqual(['ED-7K3QXM']);
    expect(text(root)).toContain('Taking you to payment');
    expect(text(root)).toContain('₹2499');
    expect(root.querySelector('button')).toBeNull();
  });

  it('when payment cannot start, explains why, keeps the booking, and offers to try again on the same booking', async () => {
    payment.outcomes = [fail('PAYMENT_GATEWAY_UNAVAILABLE', 503)];
    const { fixture, root } = await render();
    expect(text(root)).toContain('Payment did not start');
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('temporarily unavailable');
    expect(text(root)).toContain('ED-7K3QXM');

    root.querySelector<HTMLButtonElement>('button')!.click();
    await settle();
    fixture.detectChanges();
    expect(payment.references).toEqual(['ED-7K3QXM', 'ED-7K3QXM']);
  });

  it('offers no retry when trying again cannot help', async () => {
    for (const code of ['BOOKING_NOT_PAYABLE', 'PAYMENT_PHONE_UNSUPPORTED']) {
      payment.outcomes = [fail(code, 409)];
      const { root } = await render();
      expect(root.querySelector('button'), code).toBeNull();
    }
  });

  it('says how long to wait on a rate limit and disables the button meanwhile', async () => {
    payment.outcomes = [fail('RATE_LIMITED', 429, 120)];
    const { root } = await render();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('120 seconds');
    const button = root.querySelector<HTMLButtonElement>('button')!;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Please wait 120s');
  });

  it('offers to pay when the browser restores this page after a Back from PayU', async () => {
    const { fixture, root } = await render();
    const event = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(event, 'persisted', { value: true });
    window.dispatchEvent(event);
    fixture.detectChanges();
    expect(text(root)).toContain('Payment not completed');
    expect(root.querySelector('button')).not.toBeNull();
  });
});
