// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class App {
//   protected readonly title = signal('red-social-back');
// }
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './components/modal/modal';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importa el RouterOutlet y tu ModalComponent global
  imports: [CommonModule, RouterOutlet, ModalComponent],
  template: `
    <!-- 
      Agrego el Favicon y Tailwind aquí 
      (Idealmente van en index.html, pero para asegurarnos que funcione)
    -->
    <head>
      <title>Red Social</title>
      <link
        rel="icon"
        type="image/svg+xml"
        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%2338bdf8' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' /%3E%3C/svg%3E"
      />
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              },
            },
          },
        };
      </script>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #111827; /* bg-gray-900 */
          color: #f3f4f6; /* text-gray-100 */
        }
      </style>
    </head>

    <!-- Modal global para notificaciones -->
    <app-modal />

    <!-- El enrutador de Angular cargará las páginas aquí -->
    <router-outlet />
  `,
  // No se necesita `styleUrl` si los estilos están en <style>
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // El componente principal ahora solo se encarga de mostrar el router
  // y los componentes globales (como el modal).
}