import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// src/app/guards/auth-guard.ts
// ... (imports)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario existe en la señal, puede pasar
  if (authService.currentUser()) { 
    return true;
  }

  // Si no, se redirige al login
  router.navigate(['/login']);
  return false;
};