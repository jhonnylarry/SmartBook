import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            auth.logout();
            break;
          case 403:
            console.warn('[SmartBook] Acceso denegado:', error.url);
            break;
          default:
            if (error.status >= 500) {
              console.error('[SmartBook] Error del servidor:', error.message);
            }
        }
      }
      return throwError(() => error);
    })
  );
};
