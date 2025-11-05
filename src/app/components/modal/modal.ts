import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modalService.isVisible()) {
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      (click)="modalService.hide()"
    >
      <div
        class="w-11/12 max-w-md rounded-lg bg-gray-800 p-6 shadow-xl"
        (click)="$event.stopPropagation()"
      >
        <h3 class="mb-2 text-xl font-bold text-white">
          {{ modalService.title() }}
        </h3>
        <p class="mb-6 text-gray-300" [innerHTML]="modalService.message()"></p>
        <button
          (click)="modalService.hide()"
          class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Cerrar
        </button>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  modalService = inject(ModalService);
}