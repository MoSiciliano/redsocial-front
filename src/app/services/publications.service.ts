import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ModalService } from './modal.service';
import { Publication } from '../models/publication';

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  
  // Usamos la misma URL base que tu AuthService
  private apiUrl = 'http://localhost:3000'; 

  /**
   * Llama al endpoint POST /publicaciones para crear un nuevo post.
   * Recibe FormData porque puede incluir una imagen.
   */
  createPublication(formData: FormData) {
    return this.http
      .post<Publication>(`${this.apiUrl}/publicaciones`, formData, {
        withCredentials: true, // ¡CRUCIAL! Envía la cookie de sesión.
      })
      .pipe(
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        catchError((err) => {
          console.error('Error al crear la publicación:', err);

          // 1. Extraemos el mensaje de error
          const errorMsg =
            err.error?.message || 'No se pudo conectar con el servidor.';
          
          // 2. Usamos tu método .show() con dos strings
          this.modalService.show('Error al publicar', errorMsg);

          return throwError(() => err);
        })
        // --- FIN DE LA CORRECCIÓN ---
      );
  }

  // --- Próximos métodos del Sprint 2 ---
  // getPublicaciones(page: number, limit: number, sortBy: 'new' | 'likes') { ... }
  // darLike(postId: string) { ... }
  // quitarLike(postId: string) { ... }
}