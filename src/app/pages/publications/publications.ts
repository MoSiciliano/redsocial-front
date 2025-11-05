import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="mx-auto max-w-7xl p-8">
      <h1 class="text-3xl font-bold text-white">Publicaciones</h1>
      <p class="mt-2 text-gray-400">
        Acá irán las publicaciones de tus amigos (Sprint #2).
      </p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publications {}