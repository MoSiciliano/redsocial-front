import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, JsonPipe],
  template: `
    <app-navbar />
    <main class="mx-auto max-w-7xl p-8">
      <h1 class="text-3xl font-bold text-white">Mi Perfil</h1>
      <p class="mt-2 text-gray-400">Acá podrás ver y editar tu perfil (Sprint #2).</p>

      @if (authService.currentUser(); as user) {
      <div class="mt-6 w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-white">Datos del Usuario (Debug)</h2>
        <pre class="mt-4 overflow-auto rounded bg-gray-900 p-4 text-sm text-green-300"
          >{{ user | json }}
        </pre
        >
        <p class="mt-4 text-sm text-gray-400">
          Token: {{ authService.authToken()?.substring(0, 30) }}...
        </p>
      </div>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  authService = inject(AuthService);
}
