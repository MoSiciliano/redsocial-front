import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, Subscription, throwError, timer } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ModalService } from './modal.service';
import { Router } from '@angular/router';
import { Credentials } from '../models/credentials';
import { User } from '../models/user';
import { environment } from '../../enviroments/enviroment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private apiUrl = 'https://morena-siciliano-redsocial-back.vercel.app';
  apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private router = inject(Router);

  // Señales para el estado de autenticación
  currentUser = signal<User | null>(null);
  isLoading = signal(false);

  private sessionModalTimer = signal<Subscription | null>(null);
  private sessionExpireTimer = signal<Subscription | null>(null);
  private modalSubscription: Subscription | null = null;
  
  
  constructor() {
    //this.loadUserFromStorage();
  }

  // private loadUserFromStorage() {
  //   if (typeof localStorage !== 'undefined') {
  //     // Ya no leemos el token, solo el usuario
  //     const user = localStorage.getItem('currentUser');
  //     if (user) {
  //       try {
  //         this.currentUser.set(JSON.parse(user) as User);
  //       } catch (e) {
  //         console.error('Error parsing user from localStorage', e);
  //         this.logout();
  //       }
  //     }
  //   }
  // }

  login(credentials: Credentials): Observable<any> {
    this.isLoading.set(true);
    return this.http
      .post(`${this.apiUrl}/auth/login`, credentials) // El interceptor agrega withCredentials
      .pipe(
        tap((res: any) => {
           this.currentUser.set(res.user as User);

          // Guardar solo el usuario en localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(res.user));
          }
          this.startSessionTimers()
          this.isLoading.set(false);
        }),
        catchError((err) => this.handleError(err, 'Error de Login')),
        finalize(() => this.isLoading.set(false))
      );
  }


  logout() {
    this.clearSessionTimers();
    this.isLoading.set(true); // Opcional, para que se vea un feedback

    // Llamamos al endpoint de logout del back para que borre la cookie
    this.http
      .post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        // tap y catchError por si falla, pero el finalize se ejecuta siempre
        tap(() => console.log('Cookie de backend borrada')),
        catchError((err) => {
          console.error('Error al hacer logout en backend', err);
          // No importa si falla, limpiamos el front igual
          return throwError(() => new Error('Error de logout en backend'));
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.currentUser.set(null);

          // Limpiar localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('currentUser');
          }
          this.router.navigate(['/login']);
        })
      )
      .subscribe(); 
  }

 
  register(userData: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((res: any) => {
        this.isLoading.set(false);
        this.modalService.show('Registro Exitoso', '¡Usuario creado! Ya podés iniciar sesión.');
      }),
      catchError((err) => this.handleError(err, 'Error de Registro')),
      finalize(() => this.isLoading.set(false))
    );
  }

  authorize(): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/auth/authorize`, {}).pipe(
      tap((user: User) => {
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError((err) => {
        this.currentUser.set(null);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('currentUser');
        }
        return throwError(() => err); 
      })
    );
  }

  refreshSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap(() => {
        console.log('Sesión refrescada');
        // Reiniciamos los timers
        this.startSessionTimers();
      }),
      catchError((err) => {
        //forzamos logout.
        this.modalService.show('Sesión Expirada', 'Por favor, inicia sesión de nuevo.');
        this.logout();
        return EMPTY; // No emite nada más
      })
    );
  }
  startSessionTimers() {
    this.clearSessionTimers(); // Limpia timers anteriores

    // Timer para mostrar el modal de refresco (10 minutos)
    const modalTimerSub = timer(600000).subscribe(() => {
      this.modalService.showConfirm(
        'Sesión por expirar',
        'Tu sesión vence en 5 minutos. Refrescando automáticamente...',
        'Extender Sesión'
      );
      this.modalSubscription = this.modalService.choice$.subscribe(choice => {
        if (choice) {
          // El usuario dijo "Sí"
          this.refreshSession().subscribe(() => {
            this.modalService.show('Sesión Extendida', 'Tu sesión ha sido extendida 15 minutos.');
          });
        } else {
          // El usuario dijo "No" o cerró el modal
          // No hacemos nada, el timer de expiración (2) seguirá corriendo
        }
        this.modalSubscription?.unsubscribe(); // Limpiamos la suscripción
      });

    });
    this.sessionModalTimer.set(modalTimerSub);


    //  Timer para forzar logout (15 minutos)
    const expireTimerSub = timer(900000).subscribe(() => {
      this.modalService.show('Sesión Expirada', 'Tu sesión ha finalizado.');
      this.logout(); // Llama a tu método de logout
    });
    this.sessionExpireTimer.set(expireTimerSub);
  }

  clearSessionTimers() {
    this.sessionModalTimer()?.unsubscribe();
    this.sessionModalTimer.set(null);
    
    this.sessionExpireTimer()?.unsubscribe();
    this.sessionExpireTimer.set(null);

    this.modalSubscription?.unsubscribe(); 
    this.modalSubscription = null;
  }

  private handleError(error: HttpErrorResponse, defaultTitle: string): Observable<never> {
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
      description = 'Error de conexión. ¿El servidor backend (NestJS) está corriendo?';
    }

    this.modalService.show(title, description);
    return throwError(() => new Error(description));
  }
}
