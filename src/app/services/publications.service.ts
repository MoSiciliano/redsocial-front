import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ModalService } from './modal.service';
import { Publication } from '../models/publication';

export interface PaginatedPublications {
  docs: Publication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  // Usamos la misma URL base que tu AuthService
  private apiUrl = 'http://localhost:3000';

  createPublication(publication: FormData) {
    return this.http
      .post<Publication>(`${this.apiUrl}/publications`, publication, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          console.error('Error al crear la publicación:', err);

          // 1. Extraemos el mensaje de error
          const errorMsg = err.error?.message || 'No se pudo conectar con el servidor.';

          // 2. Usamos tu método .show() con dos strings
          this.modalService.show('Error al publicar', errorMsg);

          return throwError(() => err);
        })
      );
  }

  getPublications(
    page: number = 1,
    limit: number = 10,
    sortBy: 'new' | 'likes' = 'new'
  ): Observable<PaginatedPublications> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sortBy,
    });
    return this.http.get<PaginatedPublications>(
      `${this.apiUrl}/publications?${params.toString()}`,
      { withCredentials: true }
    ).pipe(
      catchError((err) => {
        console.error('Error al obtener las publicaciones:', err);
        this.modalService.show(
          'Error al cargar publicaciones',
          'No se pudieron cargar las publicaciones. Por favor, intenta nuevamente más tarde.'
        );
        return throwError(() => err);
      })
    );
  }
}
