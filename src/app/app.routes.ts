import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },

  // Rutas protegidas
  {
    path: 'posts',
    loadComponent: () => import('./pages/publications/publications').then((m) => m.Publications),
    canActivate: [authGuard],
  },

  {
    path: 'posts/:id',
    loadComponent: () => import('./pages/post/post').then((m) => m.PostDetail),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [adminGuard] // <--- ¡Candado de seguridad! Solo admins
  },
  // Redirecciones
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'posts' }, // O una página 404
];
