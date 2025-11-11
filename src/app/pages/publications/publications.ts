import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { Publication, ReactionType } from '../../models/publication';
import { CreatePost } from '../../components/create-post/create-post';
import { PublicationsService, SortByType } from '../../services/publications.service';
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

  currentSort = signal<SortByType>('new');
  sortOptions: SortByType[] = ['new', 'rockets', 'hearts', 'doubts'];

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.pubService.getPublications(1,10, this.currentSort()).subscribe({
      next: (res) => {
        this.posts.set(res.docs);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
    });
  }

  changeSort(newSort: SortByType) {
    if (this.currentSort() === newSort) return; 
    this.currentSort.set(newSort);
    this.loadPosts();
  }

  onPostCreated(newPost: Publication) {
    if (this.currentSort() === 'new') {
      this.posts.update((listaActual) => [newPost, ...listaActual]);
    }
    this.loadPosts();
  }

  getUserReaction(post: Publication): ReactionType | null {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return null;

    if (post.hearts.includes(currentUserId)) return 'heart';
    if (post.rockets.includes(currentUserId)) return 'rocket';
    if (post.doubts.includes(currentUserId)) return 'doubt';

    return null;
  }
  onReact(post: Publication, reaction: ReactionType) {
    const currentReaction = this.getUserReaction(post);
    
    let reactionToSend: ReactionType | 'remove';

    if (currentReaction === reaction) {
      // Si el usuario hace clic en la misma reacción, la quitamos
      reactionToSend = 'remove';
    } else {
      // Si hace clic en una nueva, la enviamos
      reactionToSend = reaction;
    }

    // Llamamos al nuevo servicio
    this.pubService.reactToPost(post._id, reactionToSend).subscribe({
      next: (updatedPost) => {
        // Actualizamos el post en la lista con la data nueva
        this.updatePostInList(updatedPost);
      },
      error: (err) => {
        console.error('Error al reaccionar', err);
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
