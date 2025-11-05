import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-40 bg-gray-800 shadow-md">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
      >
        <div class="flex items-center">
          <svg
            class="h-8 w-8 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span class="ml-2 text-xl font-bold text-white">RedSocial</span>
        </div>
        <div class="flex items-center space-x-4">
          <a
            routerLink="/posts"
            routerLinkActive="bg-gray-900 text-white"
            class="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
            >Publicaciones</a
          >
          <a
            routerLink="/profile"
            routerLinkActive="bg-gray-900 text-white"
            class="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
            >Mi Perfil</a
          >
          <button
            (click)="logout()"
            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}