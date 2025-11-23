import { Component, ChangeDetectionStrategy, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { Publication, ReactionType } from '../../models/publication';
import { CreatePost } from '../../components/create-post/create-post';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { CommentsService } from '../../services/comments.service';
import { FormControl, Validators, ReactiveFormsModule}  from '@angular/forms';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CreatePost, RouterLink, ReactiveFormsModule],
  templateUrl: 'publications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publications implements OnInit {
  pubService = inject(PublicationsService);
  authService = inject(AuthService);

  isLoading = signal(true);
  posts = signal<Publication[]>([]);

  currentPage = signal(1);
  totalPages = signal(1);
  isLoadingMore = signal(false);

  commentsService = inject(CommentsService);

  // Control de UI
  expandedComments = signal<Set<string>>(new Set()); // Qué posts están abiertos
  commentsCache = signal<Map<string, any[]>>(new Map()); // Comentarios cargados
  commentControl = new FormControl('', [Validators.required, Validators.maxLength(300)]);
  activePostId = signal<string | null>(null); // En qué post estoy escribiendo
  
  constructor() {
    effect(() => {
      this.pubService.currentSort();
      this.currentPage.set(1);
      this.loadPosts();
    });
  }
  ngOnInit(): void {}

  loadPosts(replace: boolean = false) {
    if (replace) {
      this.isLoading.set(true);
      this.posts.set([]);
    } else {
      this.isLoadingMore.set(true);
    }
    this.pubService.getPublications(this.currentPage(), 10).subscribe({
      next: (res) => {
        if (replace) {
          this.posts.set(res.docs);
        } else {
          this.posts.update((currentPosts) => [...currentPosts, ...res.docs]);
        }
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }
  onLoadMore() {
    if (this.currentPage() >= this.totalPages()) return; // No hay más páginas

    this.currentPage.update((page) => page + 1); // Incrementa la página
    this.loadPosts(false); // Carga más
  }
  onPostCreated(newPost: Publication) {
    if (this.pubService.currentSort() === 'new' && this.currentPage() === 1) {
      this.posts.update((listaActual) => [newPost, ...listaActual]);
    } else {
      // Si estamos en otro filtro (ej: 'rockets') o en otra página,recargo todo para que se apliquen los filtros.
      this.loadPosts(true);
    }
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
        const currentFilter = this.pubService.currentSort();
        const wasRemoval = reactionToSend === 'remove';

        if (wasRemoval && currentFilter !== 'new') {
          // Comprobamos si la reacción quitada (singular)
          // coincide con el filtro actual (plural)
          const filterMatchesReaction =
            (currentFilter === 'hearts' && reaction === 'heart') ||
            (currentFilter === 'rockets' && reaction === 'rocket') ||
            (currentFilter === 'doubts' && reaction === 'doubt');

          if (filterMatchesReaction) {
            // ...sacamos el post de la lista.
            this.removePostFromList(post._id);
          } else {
            // ...si no, solo actualizamos el post (como antes).
            this.updatePostInList(updatedPost);
          }
        } else {
          // ...si no, solo actualizamos el post (como antes).
          this.updatePostInList(updatedPost);
        }
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
      if (index === -1) return currentPosts;

      // Creamos un nuevo array (inmutabilidad)
      const newPosts = [...currentPosts];
      // Reemplazamos el post viejo por el actualizado
      newPosts[index] = updatedPost;

      return newPosts;
    });
  }
  private removePostFromList(postId: string) {
    this.posts.update((currentPosts) => currentPosts.filter((p) => p._id !== postId));
  }
  toggleComments(postId: string) {
    const currentSet = new Set(this.expandedComments());
    if (currentSet.has(postId)) {
      currentSet.delete(postId);
    } else {
      currentSet.add(postId);
      this.loadComments(postId);
    }
    this.expandedComments.set(currentSet);
  }

  loadComments(postId: string) {
    // Si no están en caché, pedirlos
    if (!this.commentsCache().has(postId)) {
      this.commentsService.getComments(postId, 1, 50).subscribe(res => {
        const newMap = new Map(this.commentsCache());
        newMap.set(postId, res.docs);
        this.commentsCache.set(newMap);
      });
    }
  }

  sendInlineComment(postId: string) {
    if (this.commentControl.invalid || !this.commentControl.value) return;
    
    this.commentsService.postComment(postId, this.commentControl.value).subscribe(newComment => {
      const newMap = new Map(this.commentsCache());
      const list = newMap.get(postId) || [];
      newMap.set(postId, [newComment, ...list]); // Agregamos el nuevo al principio
      this.commentsCache.set(newMap);
      this.commentControl.reset();
    });
  }
}
