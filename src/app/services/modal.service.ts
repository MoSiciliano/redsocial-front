import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Servicio para manejar el estado de los modales de notificación.
 * Reemplaza el uso de alert().
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  title = signal('');
  message = signal('');
  isOpen = signal(false);
  isConfirmation = signal(false); // Para saber si es un modal de sí/no
  confirmLabel = signal('Aceptar'); // Texto del botón de confirmación
  private choiceSubject = new Subject<boolean>();
  public choice$ = this.choiceSubject.asObservable();
  show(title: string, message: string) {
    this.title.set(title);
    this.message.set(message);
    this.isOpen.set(true);
    this.isConfirmation.set(false); // No es un modal de confirmación
  }

  hide() {
    this.isOpen.set(false);
  }
  showConfirm(title: string, message: string, confirmText: string = 'Aceptar') {
    this.title.set(title);
    this.message.set(message);
    this.confirmLabel.set(confirmText);
    this.isOpen.set(true);
    this.isConfirmation.set(true); // Es un modal de confirmación
  }

  confirm() {
    this.isOpen.set(false);
    this.choiceSubject.next(true); // El usuario dijo "Sí"
  }

  cancel() {
    this.isOpen.set(false);
    this.choiceSubject.next(false); // El usuario dijo "No" o cerró
  }
}
