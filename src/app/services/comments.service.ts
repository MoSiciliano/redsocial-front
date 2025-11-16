import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { environment } from '../../enviroments/enviroment.prod';
import { catchError, Observable, throwError } from 'rxjs';
import { PaginatedPublications } from './publications.service';

@Injectable({
  providedIn: 'root',
})
export class CommentsService{
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private apiUrl = environment.apiUrl;

  getComments(postId: string, page: number, limit: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/comments/${postId}?page=${page}&limit=${limit}`)
      .pipe(catchError((err) => this.handleError(err, 'Error al cargar los comentarios')));
  }

  postComment(postId: string, message: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/comments/${postId}`, { message })
      .pipe(catchError((err) => this.handleError(err, 'Error al publicar el comentario')));
  }

  private handleError(error: HttpErrorResponse, title: string){
    const msg = error.error?.message || 'Ocurrió un error inesperado';
    this.modalService.show(title, msg);
    return throwError(() => new Error(msg));
  }
}
