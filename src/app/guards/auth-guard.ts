import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
export const authGuard: CanActivateFn = async (route, state): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //  Revisa si el usuario YA está cargado en la señal
  if (authService.currentUser()) {
    authService.startSessionTimers(); // Reinicia los timers
    return true; 
  }

  //  Si no hay usuario, intenta autorizar con la cookie.
  //    Usamos 'try/catch' para manejar el éxito y el error.
  try {
    // Convertimos el Observable de authorize() en una Promesa
    // y esperamos su resultado.
    const user = await firstValueFrom(authService.authorize());

    if (user) {
      authService.startSessionTimers();
      return true; 
    }

    // Esto no debería pasar, pero por si acaso
    router.navigate(['/login']);
    return false;
  } catch (error) {
   router.navigate(['/login']);

    return false; 
  }
};
