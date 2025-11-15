// src/app/credentials.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Este interceptor clona CADA petición y le agrega 'withCredentials: true'
 * para que el navegador siempre envíe las cookies.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithCredentials = req.clone({
    withCredentials: true,
  });
  return next(reqWithCredentials);
};