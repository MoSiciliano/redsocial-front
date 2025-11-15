import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  modalService = inject(ModalService);
  confirm(){
    this.modalService.confirm();
  }
  cancel(){
    this.modalService.cancel();
  }
}