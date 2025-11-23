import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment.prod';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Para el buscador del Navbar
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Para ver el perfil de otro usuario
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }
  createUser(user: any): Observable<any> {
    // El backend espera { ...user, confirmPassword }
    // Asegúrate de que el objeto user tenga todo lo necesario
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  // --- GESTIÓN DE ESTADO (Baja/Alta) ---
  disableUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  restoreUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${id}/restore`, {});
  }

  // --- ESTADÍSTICAS DEL DASHBOARD ---
  getDashboardStats(from?: string, to?: string): Observable<any> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<any>(`${this.apiUrl}/dashboard/statistics`, { params });
  }
}