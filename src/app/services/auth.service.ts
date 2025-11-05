// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Credentials } from '../models/credentials';

// @Injectable({
//   providedIn: 'root',
// })
// export class Auth {
//   httpClient = inject(HttpClient);

//   //apiUrl = 'https://morena-siciliano-redsocial-back.vercel.app';
//    apiUrl = 'http://localhost:3000';
//   async login(credentials: Credentials) {
//     const req = this.httpClient.post(this.apiUrl + '/auth/login', credentials, {
//       headers: { 'Content-Type': 'application/json' },
//     });
//     req.subscribe((res: any) => {
//       console.log(res);
//       localStorage.setItem('token', res.token);
//     });
//   }

//   async loginCookie(credentials: Credentials) {
//     const req = this.httpClient.post(this.apiUrl + '/auth/login/cookie', credentials, {
//       withCredentials: true,
//     });
//     req.subscribe((res) => {
//       console.log(res);
//     });
//   }
//   // getData() {
//   //   const req = this.httpClient.get(this.apiUrl + '/auth/data/jwt', {
//   //     headers: {
//   //       Authorization: 'Bearer ' + localStorage.getItem('token'),
//   //     },
//   //   });
//   //   req.subscribe((res) => {
//   //     console.log(res);
//   //   });
//   // }
//   // getDataCookie() {
//   //   const req = this.httpClient.get(this.apiUrl + '/auth/data/cookie', {
//   //     withCredentials: true,
//   //   });
//   //   req.subscribe((res) => {
//   //     console.log(res);
//   //   });
//   // }
// }
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ModalService } from './modal.service';
import { Router } from '@angular/router';
import { Credentials } from '../models/credentials';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://morena-siciliano-redsocial-back.vercel.app' // URL de tu backend
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private router = inject(Router);

  // Señales para el estado de autenticación
  currentUser = signal<User | null>(null);
  authToken = signal<string | null>(null);
  isLoading = signal(false);

  constructor() {
    // Al iniciar el servicio, intentar cargar el token desde localStorage
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      if (token && user) {
        this.authToken.set(token);
        try {
          this.currentUser.set(JSON.parse(user) as User);
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
          this.logout();
        }
      }
    }
  }

  login(credentials: Credentials): Observable<any> {
    this.isLoading.set(true);
    return this.http
      .post(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res: any) => {
          this.authToken.set(res.token);
          this.currentUser.set(res.user as User);
          // Guardar en localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('currentUser', JSON.stringify(res.user));
          }
          this.isLoading.set(false);
        }),
        catchError((err) => this.handleError(err, 'Error de Login')),
        finalize(() => this.isLoading.set(false))
      );
  }

  register(userData: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((res: any) => {
        this.isLoading.set(false);
        this.modalService.show(
          'Registro Exitoso',
          '¡Usuario creado! Ya podés iniciar sesión.'
        );
      }),
      catchError((err) => this.handleError(err, 'Error de Registro')),
      finalize(() => this.isLoading.set(false))
    );
  }

  logout() {
    this.currentUser.set(null);
    this.authToken.set(null);
    // Limpiar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  private handleError(
    error: HttpErrorResponse,
    defaultTitle: string
  ): Observable<never> {
    this.isLoading.set(false);
    console.error('Error en AuthService:', error);

    let title = defaultTitle;
    let message = 'No se pudo conectar con el servidor. Intenta más tarde.';

    if (error.error && error.error.message) {
      if (Array.isArray(error.error.message)) {
        message = error.error.message.join('<br>');
      } else {
        message = error.error.message;
      }
    } else if (error.status === 0 || error.status === 503) {
      message =
        'Error de conexión. ¿El servidor backend (NestJS) está corriendo en http://localhost:3000?';
    }

    this.modalService.show(title, message);
    return throwError(() => new Error(message));
  }
}