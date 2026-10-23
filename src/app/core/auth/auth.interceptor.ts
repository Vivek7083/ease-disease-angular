import { HttpContextToken, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError } from '../api/api-error';
import { AuthService } from '../services/auth';

/** Set on the one retry after a 401, so a token that is still refused cannot loop. */
const RETRIED = new HttpContextToken<boolean>(() => false);

/** Every API route takes the login token except the public ones (health and packages). */
const needsToken = (url: string): boolean => {
  if (!url.startsWith(environment.apiBaseUrl)) {
    return false;
  }
  const path = url.slice(environment.apiBaseUrl.length);
  return path.startsWith('/v1/') && !path.startsWith('/v1/packages');
};

const withBearer = (req: HttpRequest<unknown>, token: string) => req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * Adds `Authorization: Bearer <Firebase ID token>` to API calls while someone is signed in (the SDK refreshes the
 * hourly token itself). On a 401 it fetches a fresh token and retries once; if the API still refuses, the session is
 * over and the person is signed out. The token is never logged or stored here.
 *
 * Listed before the error interceptor, so it sees failures already turned into ApiError.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!needsToken(req.url)) {
    return next(req);
  }
  const auth = inject(AuthService);
  return from(auth.idToken()).pipe(
    switchMap((token) => next(token ? withBearer(req, token) : req)),
    catchError((error: unknown) => {
      const refused = error instanceof ApiError && error.code === 'UNAUTHENTICATED';
      if (!refused || req.context.get(RETRIED) || !auth.hasSession()) {
        return throwError(() => error);
      }
      const retry = req.clone({ context: req.context.set(RETRIED, true) });
      return from(auth.idToken(true)).pipe(
        switchMap((fresh) => next(fresh ? withBearer(retry, fresh) : retry)),
        catchError((second: unknown) => {
          if (second instanceof ApiError && second.code === 'UNAUTHENTICATED') {
            auth.sessionExpired();
          }
          return throwError(() => second);
        }),
      );
    }),
  );
};
