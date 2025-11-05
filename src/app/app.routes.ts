// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },

//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: '**', redirectTo: 'home', pathMatch: 'full' },
// ];
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

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
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },


  // Redirecciones
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'publicaciones' }, // O una página 404
];
