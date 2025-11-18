import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 1. Importa Location
import { ActivatedRoute, RouterLink } from '@angular/router'; // 2. Importa ActivatedRoute
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // 3. Para el form
import { switchMap } from 'rxjs/operators';

import { PublicationsService } from '../../services/publications.service';
import { CommentsService } from '../../services/comments.service';
import { NavbarComponent} from '../../components/nav/nav' 
import { AuthService } from '../../services/auth.service';

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
  private pubService = inject(PublicationsService);
  private commentsService = inject(CommentsService);
  public location = inject(Location); 
  authService = inject(AuthService);  

  post = signal<Publication | null>(null);
  comments = signal<Comment[]>([]);
  
  // Señales para paginación
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  editingCommentId = signal<string | null>(null); // Guarda el ID del comentario que se edita
  editControl = new FormControl('', [Validators.required, Validators.maxLength(500)]);

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
          return this.commentsService.getComments(publication._id, 1, 10);
        })
      )
      .subscribe((commentsRes) => {
        this.comments.set(commentsRes.docs || []);
        this.totalPages.set(commentsRes.totalPages);
        this.currentPage.set(1);
        this.isLoading.set(false);
      });
  }

  loadMoreComments() {
    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const pubId = this.post()?._id;

    this.commentsService.getComments(pubId, nextPage, 3).subscribe((res) => {
      this.comments.update(current => [...current, ...res.docs]);
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
      this.comments.update(current => [newComment, ...current]);
      this.commentForm.reset(); 
    });
  }
  startEdit(comment: any) {
    this.editingCommentId.set(comment._id);
    this.editControl.setValue(comment.message);
  }

  // Cancela la edición
  cancelEdit() {
    this.editingCommentId.set(null);
    this.editControl.reset();
  }
  saveEdit(commentId: string) {
    if (this.editControl.invalid) return;
    
    const newMessage = this.editControl.value || '';
    
    this.commentsService.updateComment(commentId, newMessage).subscribe((updatedComment) => {
      // Actualizamos la lista localmente para que se vea el cambio sin recargar
      this.comments.update(current => 
        current.map(c => c._id === commentId ? updatedComment : c)
      );
      this.cancelEdit(); // Salimos del modo edición
    });
  }

  // Helper para el HTML: ¿Soy el autor de este comentario?
  isAuthor(authorId: string): boolean {
    return this.authService.currentUser()?._id === authorId;
  }
}