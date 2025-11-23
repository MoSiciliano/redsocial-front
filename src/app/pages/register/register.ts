import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../validators/password';
import { ageRangeValidator } from '../../validators/age';
import { ImgFallbackDirective } from "../../directives/img.directive";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ImgFallbackDirective],
  templateUrl: 'register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  authService = inject(AuthService);
  router = inject(Router);

  passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$';
  namePattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$';
  usernamePattern = '^[a-zA-Z0-9_-]{3,20}$';

  // Signal para guardar el archivo
  selectedFile = signal<File | null>(null);

  // NUEVA SEÑAL COMPUTADA PARA LA PREVISUALIZACIÓN
  selectedFileUrl = computed(() => {
    const file = this.selectedFile();
    if (file) {
      // Creamos una URL temporal para el objeto File
      return URL.createObjectURL(file);
    }
    return null;
  });

  registerForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.pattern(this.namePattern), // Validación de nombre
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.pattern(this.namePattern), // Validación de apellido
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern(this.usernamePattern),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.passwordPattern),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      birthdate: new FormControl('', [
        Validators.required,
        ageRangeValidator(13, 100), // Validación de edad
      ]),
      description: new FormControl(''),
      // El input de imagen no es parte del FormGroup
    },
    { validators: passwordMatchValidator }
  );

  // Captura el archivo seleccionado por el usuario.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    } else {
      this.selectedFile.set(null);
    }
  }

  clearFile(fileInput: HTMLInputElement) {
    this.selectedFile.set(null);
    fileInput.value = ''; 
  }

  // Envía el formulario de registro.
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // 1. Crear FormData para enviar datos y archivo
    const formData = new FormData();

    // 2. Agregar todos los campos del formulario al FormData
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      if (control) {
        formData.append(key, control.value);
      }
    });

    // 3. Agregar el archivo (si existe)
    if (this.selectedFile()) {
      formData.append('imageProfile', this.selectedFile()!);
    }

    // 4. Enviar FormData al servicio de autenticación
    this.authService.register(formData).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
