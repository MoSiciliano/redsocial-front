import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 1. Importa Location
import { ActivatedRoute, Router } from '@angular/router'; // 2. Importa ActivatedRoute
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // 3. Para el form
import { switchMap } from 'rxjs/operators';

import { PublicationsService } from '../../services/publications.service';
import { CommentsService } from '../../services/comments.service';
import { NavbarComponent } from '../../components/nav/nav';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';

type Publication = any;
type Comment = any;

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './post.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pubService = inject(PublicationsService);
  private commentsService = inject(CommentsService);
  private modalService = inject(ModalService);
  public location = inject(Location);
  authService = inject(AuthService);

  post = signal<Publication | null>(null);
  comments = signal<Comment[]>([]);

  // Señales para paginación
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(true);
  isLoadingMore = signal(false);

  isEditingPost = signal(false);
  postEditControl = new FormControl('', [Validators.required, Validators.maxLength(5000)]);

  editingCommentId = signal<string | null>(null); // Guarda el ID del comentario que se edita
  commentEditControl = new FormControl('', [Validators.required, Validators.maxLength(500)]);

  private modalSub: Subscription | null = null; // 7. Variable para la suscripción del modal
  // Formulario para nuevo comentario
  commentForm = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.maxLength(500)]),
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) throw new Error('No ID');

          this.isLoading.set(true);
          return this.pubService.getPublicationById(id);
        }),
        switchMap((publication) => {
          this.post.set(publication);
          return this.commentsService.getComments(publication._id, 1, 3);
        })
      )
      .subscribe((commentsRes) => {
        this.comments.set(commentsRes.docs || []);
        this.totalPages.set(commentsRes.totalPages);
        this.currentPage.set(1);
        this.isLoading.set(false);
      });
  }
  ngOnDestroy() {
    // 8. Nos desuscribimos del modal si es necesario
    if (this.modalSub) {
      this.modalSub.unsubscribe();
    }
  }

  loadMoreComments() {
    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const pubId = this.post()?._id;

    this.commentsService.getComments(pubId, nextPage, 3).subscribe((res) => {
      this.comments.update((current) => [...current, ...res.docs]);
      this.totalPages.set(res.totalPages);
      this.currentPage.set(nextPage);
      this.isLoadingMore.set(false);
    });
  }

  postComment() {
    if (this.commentForm.invalid) return;

    const message = this.commentForm.value.message || '';
    const pubId = this.post()?._id;

    this.commentsService.postComment(pubId, message).subscribe((newComment) => {
      this.comments.update((current) => [newComment, ...current]);
      this.commentForm.reset();
    });
  }
  getUserReaction(post: any): string | null {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId || !post) return null;

    if (post.hearts?.includes(currentUserId)) return 'heart';
    if (post.rockets?.includes(currentUserId)) return 'rocket';
    if (post.doubts?.includes(currentUserId)) return 'doubt';

    return null;
  }

  // 2. MÉTODO PARA REACCIONAR
  onReact(reaction: 'heart' | 'rocket' | 'doubt') {
    const currentPost = this.post();
    if (!currentPost) return;

    const currentReaction = this.getUserReaction(currentPost);
    let reactionToSend: 'heart' | 'rocket' | 'doubt' | 'remove';

    // Lógica de toggle: Si ya tengo esa reacción, la quito ('remove')
    if (currentReaction === reaction) {
      reactionToSend = 'remove';
    } else {
      reactionToSend = reaction;
    }

    // Llamada al servicio
    this.pubService.reactToPost(currentPost._id, reactionToSend).subscribe({
      next: (updatedPost) => {
        // Actualizamos la señal con el post nuevo que viene del back
        this.post.set(updatedPost);
      },
      error: (err) => console.error('Error al reaccionar', err),
    });
  }

  startEditPost() {
    const currentPost = this.post();
    if (currentPost) {
      this.isEditingPost.set(currentPost._id);
      this.postEditControl.setValue(currentPost.message);
    }
  }

  cancelEditPost() {
    this.isEditingPost.set(false);
    this.postEditControl.reset();
  }

  saveEditPost() {
    if (this.postEditControl.invalid) return;

    const newMessage = this.postEditControl.value || '';
    const post = this.post();
    if (post) {
      this.pubService.updatePublication(post._id, newMessage).subscribe((updatedPost) => {
        this.post.set(updatedPost);
        this.cancelEditPost();
      });
    }
  }

  startEdit(comment: any) {
    this.editingCommentId.set(comment._id);
    this.commentEditControl.setValue(comment.message);
  }

  cancelEdit() {
    this.editingCommentId.set(null);
    this.commentEditControl.reset();
  }
  saveEdit(commentId: string) {
    if (this.commentEditControl.invalid) return;

    const newMessage = this.commentEditControl.value || '';

    this.commentsService.updateComment(commentId, newMessage).subscribe((updatedComment) => {
      // Actualizamos la lista localmente para que se vea el cambio sin recargar
      this.comments.update((current) =>
        current.map((c) => (c._id === commentId ? updatedComment : c))
      );
      this.cancelEdit(); // Salimos del modo edición
    });
  }

  isAuthor(authorId: string): boolean {
    return this.authService.currentUser()?._id === authorId;
  }

  isCommentEditable(dateString: string): boolean {
    if (!dateString) return false;

    const createdDate = new Date(dateString);
    const now = new Date();

    // Diferencia en milisegundos
    const diffInMs = now.getTime() - createdDate.getTime();

    // 1 hora = 60 minutos * 60 segundos * 1000 milisegundos
    const oneHourInMs = 1000 * 60 * 60;

    return diffInMs < oneHourInMs;
  }
  canDelete(): boolean {
    const currentUser = this.authService.currentUser();
    const currentPost = this.post();
    if (!currentUser || !currentPost) return false;

    // Si es el dueño O si es admin
    return currentUser._id === currentPost.autor._id || currentUser.profile === 'admin';
  }
  isPostOwner(): boolean {
    const currentUser = this.authService.currentUser();
    const currentPost = this.post();
    return currentUser?._id === currentPost?.autor._id;
  }

  deletePost() {
    this.modalService.showConfirm(
      'Eliminar Publicación',
      '¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer.',
      'Eliminar'
    );

    this.modalSub = this.modalService.choice$.subscribe((choice) => {
      if (choice) {
        const postId = this.post()?._id;
        if (postId) {
          this.pubService.deletePublication(postId).subscribe(() => {
            this.modalService.show('Eliminado', 'La publicación ha sido eliminada.');
            this.router.navigate(['/posts']); // Redirige al home
          });
        }
      }
      // Desuscribirse para evitar múltiples llamadas si el usuario vuelve a intentar
      this.modalSub?.unsubscribe();
      this.modalSub = null;
    });
  }
}
