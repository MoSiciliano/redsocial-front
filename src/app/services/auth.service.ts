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
  //private apiUrl = 'https://morena-siciliano-redsocial-back.vercel.app';
  apiUrl = 'http://localhost:3000'; // URL de tu backend
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private router = inject(Router);

  // Señales para el estado de autenticación
  currentUser = signal<User | null>(null);
  // authToken = signal<string | null>(null); // <-- Chau token
  isLoading = signal(false);

  constructor() {
    // Al iniciar el servicio, intentar cargar el usuario desde localStorage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    if (typeof localStorage !== 'undefined') {
      // Ya no leemos el token, solo el usuario
      const user = localStorage.getItem('currentUser');
      if (user) {
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
      .post(`${this.apiUrl}/auth/login`, credentials) // El interceptor agrega withCredentials
      .pipe(
        tap((res: any) => {
          // this.authToken.set(res.token); // <-- Chau token
          this.currentUser.set(res.user as User);

          // Guardar solo el usuario en localStorage
          if (typeof localStorage !== 'undefined') {
            // localStorage.setItem('authToken', res.token); // <-- Chau token
            localStorage.setItem('currentUser', JSON.stringify(res.user));
          }
          this.isLoading.set(false);
        }),
        catchError((err) => this.handleError(err, 'Error de Login')),
        finalize(() => this.isLoading.set(false))
      );
  }

  // ... (register lo vemos en la sección de imágenes) ...

  logout() {
    this.isLoading.set(true); // Opcional, para que se vea un feedback

    // Llamamos al endpoint de logout del back para que borre la cookie
    this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      // tap y catchError por si falla, pero el finalize se ejecuta siempre
      tap(() => console.log('Cookie de backend borrada')),
      catchError((err) => {
        console.error('Error al hacer logout en backend', err);
        // No importa si falla, limpiamos el front igual
        return throwError(() => new Error('Error de logout en backend'));
      }),
      finalize(() => {
        // Esto se ejecuta SIEMPRE (éxito o error)
        this.isLoading.set(false);
        this.currentUser.set(null);
        // this.authToken.set(null); // <-- Chau token

        // Limpiar localStorage
        if (typeof localStorage !== 'undefined') {
          // localStorage.removeItem('authToken'); // <-- Chau token
          localStorage.removeItem('currentUser');
        }
        // Redirigir al login
        this.router.navigate(['/login']);
      })
    ).subscribe(); // No te olvides de suscribirte!
  }

  // ... (register y handleError quedan igual por ahora) ...
  register(userData: any): Observable<any> { //... (lo modificamos abajo)
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

  private handleError(
    error: HttpErrorResponse,
    defaultTitle: string
  ): Observable<never> {
    this.isLoading.set(false);
    console.error('Error en AuthService:', error);

    let title = defaultTitle;
    let description = 'No se pudo conectar con el servidor. Intenta más tarde.';

    if (error.error && error.error.message) {
      if (Array.isArray(error.error.message)) {
        description = error.error.message.join('<br>');
      } else {
        description = error.error.message;
      }
    } else if (error.status === 0 || error.status === 503) {
      description =
        'Error de conexión. ¿El servidor backend (NestJS) está corriendo?';
    }

    this.modalService.show(title, description);
    return throwError(() => new Error(description));
  }
}