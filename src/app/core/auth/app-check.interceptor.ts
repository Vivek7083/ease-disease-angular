import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppCheckClient } from './app-check-client';

/** The three calls the API protects with App Check (api-flow.md section 7): sign-in sync, booking creation, checkout. */
const PROTECTED = [/^\/v1\/auth\/sync$/, /^\/v1\/bookings$/, /^\/v1\/bookings\/[^/]+\/checkout$/];

/** True for a POST to one of the protected API routes. */
export function needsAppCheck(method: string, url: string): boolean {
  if (method !== 'POST' || !url.startsWith(environment.apiBaseUrl)) {
    return false;
  }
  const path = url.slice(environment.apiBaseUrl.length).split('?')[0];
  return PROTECTED.some((pattern) => pattern.test(path));
}

/** Adds `X-Firebase-AppCheck: <token>` to the protected POSTs while App Check is on. Everything else is left alone. */
export const appCheckInterceptor: HttpInterceptorFn = (req, next) => {
  if (!needsAppCheck(req.method, req.url)) {
    return next(req);
  }
  const appCheck = inject(AppCheckClient);
  if (!appCheck.enabled) {
    return next(req);
  }
  return from(appCheck.token()).pipe(
    switchMap((token) => next(token ? req.clone({ setHeaders: { 'X-Firebase-AppCheck': token } }) : req)),
  );
};
