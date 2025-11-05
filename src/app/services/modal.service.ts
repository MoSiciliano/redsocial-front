import { Injectable, signal } from '@angular/core';

/**
 * Servicio para manejar el estado de los modales de notificación.
 * Reemplaza el uso de alert().
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  isVisible = signal(false);
  title = signal('');
  message = signal('');

  show(title: string, message: string) {
    this.title.set(title);
    this.message.set(message);
    this.isVisible.set(true);
  }

  hide() {
    this.isVisible.set(false);
  }
}