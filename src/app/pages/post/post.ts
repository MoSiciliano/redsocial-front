// En: src/app/pages/post-detail/post-detail.ts (Reemplaza el contenido)
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 1. Importa Location
import { ActivatedRoute, RouterLink } from '@angular/router'; // 2. Importa ActivatedRoute
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // 3. Para el form
import { switchMap } from 'rxjs/operators';

import { PublicationsService } from '../../services/publications.service';
import { CommentsService } from '../../services/comments.service';
import { NavbarComponent} from '../../components/nav/nav' 

// (Importa tus modelos de Publication y Comment)
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
  public location = inject(Location); // Para el botón "Volver"

  post = signal<Publication | null>(null);
  comments = signal<Comment[]>([]);
  
  // Señales para paginación
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(true);
  isLoadingMore = signal(false);

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
          // 1. Carga la publicación
          return this.pubService.getPublicationsById(id);
        }),
        switchMap((publication) => {
          this.post.set(publication);
          // 2. Carga la PÁGINA 1 de comentarios [cite: 105]
          return this.commentsService.getComments(publication._id, 1, 10);
        })
      )
      .subscribe((commentsRes) => {
        this.comments.set(commentsRes.docs);
        this.totalPages.set(commentsRes.totalPages);
        this.currentPage.set(1);
        this.isLoading.set(false);
      });
  }

  // Consigna: "presiona un botón 'cargar más'" [cite: 105]
  loadMoreComments() {
    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const pubId = this.post()?._id;

    this.commentsService.getComments(pubId, nextPage, 10).subscribe((res) => {
      // Consigna: "sin dejar de mostrar los anteriores" [cite: 105]
      this.comments.update(current => [...current, ...res.docs]);
      this.totalPages.set(res.totalPages);
      this.currentPage.set(nextPage);
      this.isLoadingMore.set(false);
    });
  }

  // Para postear un nuevo comentario
  postComment() {
    if (this.commentForm.invalid) return;
    
    const message = this.commentForm.value.message || '';
    const pubId = this.post()?._id;

    this.commentsService.postComment(pubId, message).subscribe((newComment) => {
      // Añade el nuevo comentario al PRINCIPIO de la lista
      this.comments.update(current => [newComment, ...current]);
      this.commentForm.reset(); // Limpia el formulario
    });
  }
}