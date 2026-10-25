import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BookingModalService, type BookingMode } from '../../../core/services/booking-modal';
import { SignInStep } from './sign-in-step';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

/** The few parts of AuthService the step uses, with calls recorded. */
class FakeAuth {
  busy = signal(false);
  error = signal<string | null>(null);
  needsRetry = signal(false);
  googleCalls = 0;
  linkRequests: { email: string; next: string }[] = [];
  linkResult = true;
  retryCalls = 0;
  signInWithGoogle = async () => {
    this.googleCalls++;
    return true;
  };
  sendEmailLink = async (email: string, next: string) => {
    this.linkRequests.push({ email, next });
    return this.linkResult;
  };
  retry = async () => {
    this.retryCalls++;
  };
}

describe('SignInStep', () => {
  let auth: FakeAuth;
  let modal: BookingModalService;

  const render = (mode: BookingMode) => {
    const fixture = TestBed.createComponent(SignInStep);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
    return fixture;
  };
  const el = (fixture: { nativeElement: unknown }) => fixture.nativeElement as HTMLElement;
  const typeEmail = (root: HTMLElement, value: string) => {
    const input = root.querySelector<HTMLInputElement>('#si-email')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submitForm = async (root: HTMLElement) => {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  };

  beforeEach(() => {
    sessionStorage.clear();
    auth = new FakeAuth();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
    modal = TestBed.inject(BookingModalService);
  });

  it('tells a person booking that one step covers signing in and signing up, with no password', () => {
    const text = el(render('book')).textContent ?? '';
    expect(text).toContain('Sign in or create your account to book');
    expect(text).toContain('do not need a password');
  });

  it('says log in or sign up when opened from the navbar', () => {
    expect(el(render('sign-in')).textContent).toContain('Log in, or sign up if you are new');
  });

  it('starts Google sign-in from the button', () => {
    const fixture = render('book');
    el(fixture).querySelector<HTMLButtonElement>('.btn-google')!.click();
    expect(auth.googleCalls).toBe(1);
  });

  it('disables both ways in while a sign-in step is running', () => {
    auth.busy.set(true);
    const root = el(render('book'));
    expect(root.querySelector<HTMLButtonElement>('.btn-google')!.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('.btn-primary')!.disabled).toBe(true);
  });

  it('refuses an empty or malformed email and shows why, without sending anything', async () => {
    const fixture = render('book');
    const root = el(fixture);
    await submitForm(root);
    fixture.detectChanges();
    expect(root.querySelector('#si-email-error')?.textContent).toContain('Enter your email address');

    typeEmail(root, 'not-an-email');
    await submitForm(root);
    fixture.detectChanges();
    expect(root.querySelector('#si-email-error')?.textContent).toContain('valid email');
    expect(auth.linkRequests).toEqual([]);
  });

  it('sends the link, shows the check-your-inbox message, and remembers a booking in progress', async () => {
    const fixture = render('book');
    const root = el(fixture);
    typeEmail(root, 'priya@example.com');
    await submitForm(root);
    fixture.detectChanges();

    expect(auth.linkRequests).toHaveLength(1);
    expect(auth.linkRequests[0].email).toBe('priya@example.com');
    expect(auth.linkRequests[0].next.startsWith('/')).toBe(true);
    expect(root.querySelector('.sent')?.textContent).toContain('priya@example.com');
    expect(modal.consumeBookIntent()).toBe(true);
  });

  it('does not treat a plain log-in as a booking', async () => {
    const fixture = render('sign-in');
    const root = el(fixture);
    typeEmail(root, 'priya@example.com');
    await submitForm(root);
    expect(auth.linkRequests).toHaveLength(1);
    expect(modal.consumeBookIntent()).toBe(false);
  });

  it('stays on the form when the link could not be sent', async () => {
    auth.linkResult = false;
    auth.error.set('Check your connection and try again.');
    const fixture = render('book');
    const root = el(fixture);
    typeEmail(root, 'priya@example.com');
    await submitForm(root);
    fixture.detectChanges();
    expect(root.querySelector('.sent')).toBeNull();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Check your connection');
  });

  it('offers a retry when the sign-in could not be confirmed', () => {
    auth.needsRetry.set(true);
    const fixture = render('book');
    el(fixture).querySelector<HTMLButtonElement>('.notice button')!.click();
    expect(auth.retryCalls).toBe(1);
  });
});
