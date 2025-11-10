import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { Publication } from '../../models/publication';
import { CreatePost } from '../../components/create-post/create-post';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CreatePost],
  templateUrl: 'publications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publications implements OnInit {
  private pubService = inject(PublicationsService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  posts = signal<Publication[]>([]);

  ngOnInit(): void {
    this.loadPosts();
  }
  loadPosts() {
    this.isLoading.set(true);
    this.pubService.getPublications().subscribe({
      next: (res) => {
        this.posts.set(res.docs);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
    });
  }
  onPostCreated(newPost: Publication) {
    console.log('¡Nuevo post creado!:', newPost);
    this.posts.update((currentPosts) => [newPost, ...currentPosts]);
  }
  isPostLikedByUser(post: Publication): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return false;
    return post.likes.includes(currentUserId);
  }
  onLikeToggle(post: Publication) {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) {
      console.error('Usuario no logueado, no puede dar like.');
      return;
    }

    const isLiked = this.isPostLikedByUser(post);

    // Creamos el observable (ya sea para dar o quitar like)
    const request$ = isLiked
      ? this.pubService.removeLike(post._id)
      : this.pubService.addLike(post._id);

    // Nos suscribimos
    request$.subscribe({
      next: (updatedPost) => {
        // Cuando el back responde, actualizamos solo ese post en la señal
        this.updatePostInList(updatedPost);
      },
      error: (err) => {
        console.error('Error al actualizar like', err);
        // (Opcional: podríamos revertir el like visualmente si falla)
      },
    });
  }
  private updatePostInList(updatedPost: Publication) {
    this.posts.update((currentPosts) => {
      // Buscamos el índice del post a actualizar
      const index = currentPosts.findIndex((p) => p._id === updatedPost._id);
      if (index === -1) return currentPosts; // No lo encontró (raro)

      // Creamos un nuevo array (inmutabilidad)
      const newPosts = [...currentPosts];
      // Reemplazamos el post viejo por el actualizado
      newPosts[index] = updatedPost;

      return newPosts;
    });
  }
}
