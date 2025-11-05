import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../validators/password';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
          <!-- Nombre -->
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
            <p class="mt-1 text-xs text-red-400">Nombre es requerido.</p>
            }
          </div>

          <!-- Apellido -->
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
            <p class="mt-1 text-xs text-red-400">Apellido es requerido.</p>
            }
          </div>

          <!-- Email -->
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

          <!-- Nombre de Usuario -->
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

          <!-- Fecha de Nacimiento -->
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
              Fecha de nacimiento es requerida.
            </p>
            }
          </div>

          <!-- Contraseña -->
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

          <!-- Repetir Contraseña -->
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

          <!-- URL Imagen de Perfil -->
          <div class="md:col-span-2">
            <label
              for="imagenPerfil"
              class="mb-2 block text-sm font-medium text-gray-300"
              >URL de Imagen de Perfil (Opcional)</label
            >
            <input
              id="imagenPerfil"
              formControlName="imagenPerfil"
              type="text"
              placeholder="https://ejemplo.com/imagen.png"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p class="mt-1 text-xs text-gray-400">
              Tu backend espera una URL, no un archivo. Pega el link a tu imagen
              acá.
            </p>
          </div>

          <!-- Descripción -->
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

          <!-- Submit Button -->
          <div class="md:col-span-2">
            <button
              type="submit"
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

        <!-- Link to Login -->
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

  // Expresión regular para la contraseña:
  // 8+ caracteres, 1 mayúscula, 1 número.
  passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$';

  registerForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.passwordPattern),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      birthdate: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      imagenPerfil: new FormControl(''),
    },
    { validators: passwordMatchValidator }
  );

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Quitamos confirmPassword antes de enviar al backend
    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe(() => {
      // El servicio muestra el modal de éxito
      this.router.navigate(['/login']);
    });
  }
}