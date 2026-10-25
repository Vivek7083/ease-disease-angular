import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toApiError } from './api-error';

/** Maps every failed response to an ApiError, so callers only ever handle one error type. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => throwError(() => (error instanceof HttpErrorResponse ? toApiError(error) : error))),
  );
