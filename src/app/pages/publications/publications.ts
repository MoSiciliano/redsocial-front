import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { Publication } from '../../models/publication';
import { CreatePost } from '../../components/create-post/create-post';
import { PublicationsService } from '../../services/publications.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CreatePost],
  templateUrl: 'publications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publications implements OnInit {
  private pubService = inject(PublicationsService);

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
  onPostCreado(newPost: Publication) {
    this.posts.update((listaActual) => [newPost, ...listaActual]);
  }
}
