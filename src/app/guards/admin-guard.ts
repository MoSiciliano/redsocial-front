import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs'; // <--- IMPORTANTE

export const adminGuard: CanActivateFn = async (route, state) => { // <--- Añadir async
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Intentamos obtener el usuario actual de la memoria
  let user = authService.currentUser(); 

  // 2. Si no está en memoria (porque recargaste la página), preguntamos al backend
  if (!user) {
    try {
      // Esperamos a que el backend nos diga quién es el usuario (usando la cookie)
      user = await firstValueFrom(authService.authorize());
    } catch (error) {
      // Si falla (no hay cookie o expiró), mandamos al login
      router.navigate(['/login']);
      return false;
    }
  }

  // 3. Ahora que estamos seguros de quién es el usuario, verificamos el rol
  if (user && user.profile === 'admin') {
    return true; // ¡Pase usted!
  }

  // 4. Si está logueado pero no es admin, lo mandamos a los posts
  alert('Acceso denegado: Se requieren permisos de administrador.');
  router.navigate(['/posts']);
  return false;
};