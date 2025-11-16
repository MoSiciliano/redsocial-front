import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 1. Importa Location
import { ActivatedRoute, RouterLink } from '@angular/router'; // 2. Importa ActivatedRoute
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // 3. Para el form
import { switchMap } from 'rxjs/operators';

import { PublicationsService } from '../../services/publications.service';
import { CommentsService } from '../../services/comments.service';
import { NavbarComponent} from '../../components/nav/nav' 

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

    this.commentsService.getComments(pubId, nextPage, 10).subscribe((res) => {
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
}