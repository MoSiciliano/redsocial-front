// src/app/pages/register/register.ts

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // <-- Importa RouterLink
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../validators/password';
import { ageRangeValidator } from '../../validators/age'; // <-- Importa el validador de edad

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // <-- Agrega RouterLink
  template: `
    <div
      class="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12"
    >
      <div
        class="w-full max-w-2xl rounded-xl bg-gray-800 p-8 shadow-2xl"
      >
        <h1 class="mb-8 text-center text-3xl font-bold text-white">
          Crear una Cuenta
        </h1>

        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()" 
          class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2"
        >
          <div>
            <label
              for="name"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Nombre</label
            >
            <input
              id="name"
              formControlName="name"
              type="text"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('name')?.invalid &&
                registerForm.get('name')?.touched
              "
            />
            @if (
              registerForm.get('name')?.invalid &&
              (registerForm.get('name')?.dirty ||
                registerForm.get('name')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('name')?.errors?.['required']) {
              Nombre es requerido.
              } @if (registerForm.get('name')?.errors?.['pattern']) {
              Solo letras y espacios.
              }
            </p>
            }
          </div>

          <div>
            <label
              for="lastname"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Apellido</label
            >
            <input
              id="lastname"
              formControlName="lastname"
              type="text"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('lastname')?.invalid &&
                registerForm.get('lastname')?.touched
              "
            />
            @if (
              registerForm.get('lastname')?.invalid &&
              (registerForm.get('lastname')?.dirty ||
                registerForm.get('lastname')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('lastname')?.errors?.['required']) {
              Apellido es requerido.
              } @if (registerForm.get('lastname')?.errors?.['pattern']) {
              Solo letras y espacios.
              }
            </p>
            }
          </div>

          <div class="md:col-span-2">
            <label
              for="email"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Email</label
            >
            <input
              id="email"
              formControlName="email"
              type="email"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('email')?.invalid &&
                registerForm.get('email')?.touched
              "
            />
            @if (
              registerForm.get('email')?.invalid &&
              (registerForm.get('email')?.dirty ||
                registerForm.get('email')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('email')?.errors?.['required']) {
              Email es requerido.
              } @if (registerForm.get('email')?.errors?.['email']) {
              Debe ser un email válido.
              }
            </p>
            }
          </div>

          <div>
            <label
              for="username"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Nombre de Usuario</label
            >
            <input
              id="username"
              formControlName="username"
              type="text"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('username')?.invalid &&
                registerForm.get('username')?.touched
              "
            />
            @if (
              registerForm.get('username')?.invalid &&
              (registerForm.get('username')?.dirty ||
                registerForm.get('username')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">Usuario es requerido.</p>
            }
          </div>

          <div>
            <label
              for="birthdate"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Fecha de Nacimiento</label
            >
            <input
              id="birthdate"
              formControlName="birthdate"
              type="date"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('birthdate')?.invalid &&
                registerForm.get('birthdate')?.touched
              "
            />
            @if (
              registerForm.get('birthdate')?.invalid &&
              (registerForm.get('birthdate')?.dirty ||
                registerForm.get('birthdate')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('birthdate')?.errors?.['required']) {
              Fecha requerida.
              } @if (registerForm.get('birthdate')?.errors?.['minAge']) {
              Debes tener al menos 13 años.
              } @if (registerForm.get('birthdate')?.errors?.['maxAge']) {
              Edad máxima 100 años.
              } @if (registerForm.get('birthdate')?.errors?.['invalidDate']) {
              Fecha inválida.
              }
            </p>
            }
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Contraseña</label
            >
            <input
              id="password"
              formControlName="password"
              type="password"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                registerForm.get('password')?.invalid &&
                registerForm.get('password')?.touched
              "
            />
            @if (
              registerForm.get('password')?.invalid &&
              (registerForm.get('password')?.dirty ||
                registerForm.get('password')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('password')?.errors?.['required']) {
              Requerida.
              } @if (registerForm.get('password')?.errors?.['pattern']) {
              Debe tener 8+ caracteres, 1 mayúscula y 1 número.
              }
            </p>
            }
          </div>

          <div>
            <label
              for="confirmPassword"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Repetir Contraseña</label
            >
            <input
              id="confirmPassword"
              formControlName="confirmPassword"
              type="password"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                (registerForm.get('confirmPassword')?.invalid &&
                  registerForm.get('confirmPassword')?.touched) ||
                (registerForm.errors?.['passwordMismatch'] &&
                  registerForm.get('confirmPassword')?.touched)
              "
            />
            @if (
              registerForm.get('confirmPassword')?.invalid &&
              (registerForm.get('confirmPassword')?.dirty ||
                registerForm.get('confirmPassword')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (registerForm.get('confirmPassword')?.errors?.['required']) {
              Requerida.
              }
            </p>
            } @if (
              registerForm.errors?.['passwordMismatch'] &&
              (registerForm.get('confirmPassword')?.dirty ||
                registerForm.get('confirmPassword')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">Las contraseñas no coinciden.</p>
            }
          </div>

          <div class="md:col-span-2">
            <label
              for="imagenPerfil"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Imagen de Perfil (Opcional)</label
            >
            <input
              id="imagenPerfil"
              type="file"
              (change)="onFileSelected($event)"
              accept="image/png, image/jpeg, image/webp"
              class="w-full text-sm text-gray-400
                file:mr-4 file:rounded-md file:border-0
                file:bg-blue-600 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-blue-700 file:cursor-pointer"
            />
            @if (selectedFile(); as file) {
            <p class="mt-2 text-xs text-green-400">
              Archivo seleccionado: {{ file.name }}
            </p>
            }
          </div>

          <div class="md:col-span-2">
            <label
              for="description"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Descripción Breve (Opcional)</label
            >
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="md:col-span-2">
            <button
              type="submit"
              [disabled]="registerForm.invalid || authService.isLoading()"
              class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              @if (authService.isLoading()) {
              <div
                class="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
              } @else {
              Registrarse
              }
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-400">
          ¿Ya tenés cuenta?
          <a
            routerLink="/login"
            class="cursor-pointer font-medium text-blue-400 hover:text-blue-300"
          >
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  authService = inject(AuthService);
  router = inject(Router);

  // Regex para contraseña
  passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$';
  
  // Regex para nombres (letras, espacios, acentos, ñ)
  namePattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$';
  
  // Signal para guardar el archivo
  selectedFile = signal<File | null>(null);

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
      username: new FormControl('', [Validators.required]),
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

  /**
   * Captura el archivo seleccionado por el usuario.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    } else {
      this.selectedFile.set(null);
    }
  }

  /**
   * Envía el formulario de registro.
   */
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // 1. Crear FormData para enviar datos y archivo
    const formData = new FormData();

    // 2. Agregar todos los campos del formulario al FormData
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        // Asegurarnos de que no mandamos 'confirmPassword'
        if (key !== 'confirmPassword') {
          formData.append(key, control.value);
        }
      }
    });
      
    // 3. Agregar el archivo (si existe)
    if (this.selectedFile()) {
      formData.append('imagenPerfil', this.selectedFile()!);
    }

    // 4. Enviar FormData al servicio de autenticación
    this.authService.register(formData).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}