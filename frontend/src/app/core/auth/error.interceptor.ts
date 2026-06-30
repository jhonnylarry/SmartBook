import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          auth.logout();
          return throwError(() => error);
        }

        const apiError = error.error as Partial<ApiError>;
        const mensaje = apiError?.message ?? 'Ha ocurrido un error inesperado.';

        if (error.status === 403) {
          toast.error('Sin permisos para realizar esta acción.');
        } else if (error.status >= 400 && error.status < 500) {
          toast.error(mensaje);
        } else if (error.status >= 500) {
          toast.error('Error del servidor. Intente nuevamente.');
        } else if (error.status === 0) {
          toast.error('No se pudo conectar con el servidor. Verifique su conexión.');
        }
      }

      return throwError(() => error);
    })
  );
};
