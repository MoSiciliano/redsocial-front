import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia para proteger rutas que requieren autenticación.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario tiene un token, puede pasar
  if (authService.authToken()) {
    return true;
  }

  // Si no, se redirige al login
  router.navigate(['/login']);
  return false;
};