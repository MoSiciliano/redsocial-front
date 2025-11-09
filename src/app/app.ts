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
    <app-modal />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // El componente principal ahora solo se encarga de mostrar el router
  // y los componentes globales (como el modal).
}
