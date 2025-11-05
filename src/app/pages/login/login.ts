// import { Component, inject } from '@angular/core';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-login',
//   imports: [],
//   templateUrl: './login.html',
//   styleUrl: './login.css',
// })
// export class Login {
//   auth = inject(AuthService);

//   login() {
//     this.auth.login({ identifier: 'morenadmina', password: 'Password01' });
//   }
//   loginCookie() {
//     this.auth.loginCookie({ identifier: 'morena123', password: 'Password1' });
//   }
//   // getData() {
//   //   this.auth.getData();
//   // }
//   //  getDataCookie() {
//   //   this.auth.getDataCookie();
//   // }
// }
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
import { Credentials } from '../../models/credentials';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4"
    >
      <div
        class="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-2xl"
      >
        <div class="mb-8 text-center">
          <svg
            class="mx-auto h-12 w-12 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h1 class="mt-2 text-3xl font-bold text-white">Iniciar Sesión</h1>
          <p class="text-gray-400">Bienvenido de vuelta</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Identifier -->
          <div class="mb-4">
            <label
              for="identifier"
              class="mb-2 block text-sm font-medium text-gray-300"
              >Usuario o Email</label
            >
            <input
              id="identifier"
              formControlName="identifier"
              type="text"
              class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              [class.border-red-500]="
                loginForm.get('identifier')?.invalid &&
                loginForm.get('identifier')?.touched
              "
            />
            @if (
              loginForm.get('identifier')?.invalid &&
              (loginForm.get('identifier')?.dirty ||
                loginForm.get('identifier')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (loginForm.get('identifier')?.errors?.['required']) {
              Este campo es requerido.
              }
            </p>
            }
          </div>

          <!-- Password -->
          <div class="mb-6">
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
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            />
            @if (
              loginForm.get('password')?.invalid &&
              (loginForm.get('password')?.dirty ||
                loginForm.get('password')?.touched)
            ) {
            <p class="mt-1 text-xs text-red-400">
              @if (loginForm.get('password')?.errors?.['required']) {
              La contraseña es requerida.
              }
            </p>
            }
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            @if (authService.isLoading()) {
            <div
              class="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
            } @else {
            Ingresar
            }
          </button>
        </form>

        <!-- Link to Register -->
        <p class="mt-6 text-center text-sm text-gray-400">
          ¿No tenés cuenta?
          <a
            routerLink="/register"
            class="cursor-pointer font-medium text-blue-400 hover:text-blue-300"
          >
            Registrate acá
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login{
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = new FormGroup({
    identifier: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService
      .login(this.loginForm.value as Credentials)
      .subscribe(() => {
        console.log("entraste");
        
        this.router.navigate(['/posts']);
      });
  }
}