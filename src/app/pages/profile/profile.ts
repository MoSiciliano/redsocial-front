import { Component, OnInit, inject, signal } from '@angular/core'; // <-- 1. Importa OnInit, signal
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicationsService } from '../../services/publications.service'; // <-- 2. Importa el servicio de Pubs
import { Publication, ReactionType } from '../../models/publication'; // <-- 3. Importa el modelo
import { NavbarComponent } from '../../components/nav/nav';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent], 
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  
  authService = inject(AuthService);
  private pubService = inject(PublicationsService); 
  // --- Señales de Estado ---
  myPosts = signal<Publication[]>([]);
  isLoading = signal(true);
  // El currentUser() ya lo provee el authService

  ngOnInit() {
    this.loadMyPosts();
  }

  loadMyPosts() {
    this.isLoading.set(true);
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    const userId = currentUser._id;
    this.pubService
      .getPublications(1, 3, {
        sortBy: 'new', 
        userId: userId, 
      })
      .subscribe({
        next: (res) => {
          this.myPosts.set(res.docs);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar mis publicaciones:', err);
          this.isLoading.set(false);
        },
      });
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
      reactionToSend = 'remove';
    } else {
      reactionToSend = reaction;
    }

    // El pubService ya está inyectado, así que esto funciona
    this.pubService.reactToPost(post._id, reactionToSend).subscribe({
      next: (updatedPost) => {
        // Usamos el método de actualizar para myPosts
        this.updatePostInList(updatedPost);
      },
      error: (err) => {
        console.error('Error al reaccionar', err);
      },
    });
  }

  private updatePostInList(updatedPost: Publication) {
    // Actualizamos la señal myPosts (¡cuidado que aquí se llama 'myPosts'!)
    this.myPosts.update((currentPosts) => { 
      const index = currentPosts.findIndex((p) => p._id === updatedPost._id);
      if (index === -1) return currentPosts;

      const newPosts = [...currentPosts];
      newPosts[index] = updatedPost;
      return newPosts;
    });
  }
}
