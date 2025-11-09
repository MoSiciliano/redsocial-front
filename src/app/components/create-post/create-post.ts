import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicationsService } from '../../services/publications.service';
import { Publication } from '../../models/publication';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePost {
  // Servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private pubService = inject(PublicationsService);
  private modalService = inject(ModalService);

  // Señales
  currentUser = this.authService.currentUser; // Traemos al usuario logueado
  selectedFile = signal<File | null>(null);
  isLoading = signal(false);

  // Evento para avisar cuando se crea un post
  @Output() postCreado = new EventEmitter<Publication>();

  // Formulario
  postForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    message: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  // Previsualización de imagen
  previewUrl = computed(() => {
    const file = this.selectedFile();
    return file ? URL.createObjectURL(file) : null;
  });

  // Manejo del archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  clearFile(fileInput: HTMLInputElement) {
    this.selectedFile.set(null);
    fileInput.value = '';
  }

  // Envío del formulario
  onSubmit() {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);

    // 1. Construir el FormData
    const formData = new FormData();
    formData.append('title', this.postForm.value.title!);
    formData.append('message', this.postForm.value.message!);
    
    const file = this.selectedFile();
    if (file) {
      formData.append('image', file);
    }

    // 2. Llamar al servicio
    this.pubService.createPublication(formData).subscribe({
      next: (newPublication) => {
        this.isLoading.set(false);
        // 3. Limpiar formulario y avisar al padre
        this.resetForm();
        this.postCreado.emit(newPublication);
        this.modalService.show(
            'Publicación creada', 'Tu publicación fue creada con éxito.'
        );
      },
      error: () => {
        this.isLoading.set(false);
        // El modal de error ya se muestra en el servicio
      },
    });
  }

  private resetForm() {
    this.postForm.reset();
    this.selectedFile.set(null);
    
  }
}