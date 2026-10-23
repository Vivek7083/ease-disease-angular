import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/services/auth';
import { SessionNotice } from './session-notice';

class FakeAuth {
  sessionNotice = signal<string | null>(null);
  needsRetry = signal(false);
  signInOpened = 0;
  retried = 0;
  dismissed = 0;
  openSignIn = () => this.signInOpened++;
  retry = async () => {
    this.retried++;
  };
  dismissNotice = () => {
    this.dismissed++;
    this.sessionNotice.set(null);
  };
}

describe('SessionNotice', () => {
  let auth: FakeAuth;

  const render = () => {
    const fixture = TestBed.createComponent(SessionNotice);
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    auth = new FakeAuth();
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
  });

  it('shows nothing when nothing is wrong', () => {
    expect(render().root.querySelector('.note')).toBeNull();
  });

  it('tells a person who was signed out by an error, with a way to log in and a way to dismiss it', () => {
    auth.sessionNotice.set('Your session ended. Please sign in again.');
    const { fixture, root } = render();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Your session ended');
    root.querySelector<HTMLButtonElement>('.action')!.click();
    expect(auth.signInOpened).toBe(1);
    root.querySelector<HTMLButtonElement>('.dismiss')!.click();
    fixture.detectChanges();
    expect(auth.dismissed).toBe(1);
    expect(root.querySelector('.note')).toBeNull();
  });

  it('offers Try again when the sign-in could not be confirmed, announced as an alert', () => {
    auth.needsRetry.set(true);
    const { root } = render();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('could not confirm your sign-in');
    root.querySelector<HTMLButtonElement>('.action')!.click();
    expect(auth.retried).toBe(1);
  });
});
