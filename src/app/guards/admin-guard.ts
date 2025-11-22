import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs'; //

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si ya tenemos el usuario en memoria (ej: navegando normal)
  const currentUser = authService.currentUser();

  if (currentUser) {
    if (currentUser.profile === 'admin') {
      return true; // Es admin y ya lo sabíamos -> PASA
    } else {
      router.navigate(['/posts']); // Es usuario normal -> AFUERA
      return false;
    }
  }

  // 2. Si NO hay usuario (ej: al dar F5), intentamos recuperarlo del Backend
  try {
    // "await" detiene al guard hasta que el backend responda. ¡Esto es la clave!
    const user = await firstValueFrom(authService.authorize());

    if (user && user.profile === 'admin') {
      return true; // Recuperamos sesión y es admin -> PASA
    } else {
      // Recuperamos sesión pero NO es admin
      router.navigate(['/posts']);
      return false;
    }
  } catch (error) {
    // Si falla (no hay cookie, token vencido), mandamos al login
    router.navigate(['/login']);
    return false;
  }
};