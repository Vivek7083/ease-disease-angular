import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';
import { FirebaseAuthClient } from './core/auth/firebase-auth-client';

/** jsdom has no matchMedia; the app shell reads it for reduced motion and the phone-width navbar. */
const stubMatchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

/** No Firebase in unit tests: nobody is signed in, and nothing is loaded from the network. */
const signedOutFirebase = {
  watch: async (onChange: (user: null) => void) => onChange(null),
};

describe('App', () => {
  beforeEach(async () => {
    window.matchMedia ??= stubMatchMedia;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SwUpdate, useValue: { isEnabled: false } },
        { provide: FirebaseAuthClient, useValue: signedOutFirebase },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the wordmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-wordmark')).toBeTruthy();
  });
});
