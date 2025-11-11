import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ModalService } from './modal.service';
import { Publication, ReactionType } from '../models/publication';

export interface PaginatedPublications {
  docs: Publication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type SortByType = 'new' | 'rockets' | 'hearts' | 'doubts';

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  private apiUrl = 'http://localhost:3000';

  createPublication(publication: FormData): Observable<Publication> {
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
    sortBy: SortByType = 'new',
    userId?: string
  ): Observable<PaginatedPublications> {
    const paramsConfig: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sortBy,
    };
    if (userId) {
      paramsConfig['userId'] = userId;
    }
    const params = new URLSearchParams(paramsConfig);

    return this.http
      .get<PaginatedPublications>(`${this.apiUrl}/publications?${params.toString()}`, {
        withCredentials: true,
      })
      .pipe(
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
  reactToPost(
    postId: string,
    reaction: ReactionType | 'remove' // 'heart', 'rocket', 'doubt' o 'remove'
  ): Observable<Publication> {
    // El DTO del backend espera un body: { reaction: '...' }
    const body = { reaction: reaction };

    return this.http
      .post<Publication>(`${this.apiUrl}/publications/${postId}/react`, body, {
        withCredentials: true,
      })
      .pipe(catchError((err) => this.handleReactionError(err)));
  }
  private handleReactionError(err: any): Observable<never> {
    console.error('Error en la operación de Reacción:', err);
    // No mostramos modal para que sea más rápido
    return throwError(() => err);
  }
  // addLike(postId: string): Observable<Publication> {
  //   return this.http
  //     .post<Publication>(`${this.apiUrl}/publications/${postId}/like`, { withCredentials: true })
  //     .pipe(catchError((err) => this.handleLikeError(err)));
  // }
  // removeLike(postId: string): Observable<Publication> {
  //   return this.http
  //     .delete<Publication>(`${this.apiUrl}/publications/${postId}/like`, { withCredentials: true })
  //     .pipe(catchError((err) => this.handleLikeError(err)));
  // }
  // private handleLikeError(err: any): Observable<never> {
  //   console.error('Error en la operación de Like:', err);
  //   // No mostramos modal para que sea más rápido, pero sí logueamos
  //   return throwError(() => err);
  // }
}
