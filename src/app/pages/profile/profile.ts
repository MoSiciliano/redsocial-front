import { Component, OnInit, inject, signal } from '@angular/core'; // <-- 1. Importa OnInit, signal
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicationsService } from '../../services/publications.service'; // <-- 2. Importa el servicio de Pubs
import { Publication, ReactionType } from '../../models/publication'; // <-- 3. Importa el modelo
import { NavbarComponent } from '../../components/nav/nav';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImgFallbackDirective } from '../../directives/img.directive';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ImgFallbackDirective, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  
  authService = inject(AuthService);
  private pubService = inject(PublicationsService); 
  private usersService = inject(UsersService); // Inyectar
  private route = inject(ActivatedRoute);      
  private modalService = inject(ModalService);

  // --- Señales de Estado ---
  myPosts = signal<Publication[]>([]);
  isLoading = signal(true);

  profileUser = signal<any>(null); 

  ngOnInit() {
    // Suscribirse a cambios en la URL (por si busco a alguien estando en mi perfil)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadProfileData(id);
    });
  }

  loadProfileData(id: string | null) {
    this.isLoading.set(true);
    this.myPosts.set([]); // Limpiar posts anteriores

    // Si es 'me' o no hay ID, es mi perfil
    if (!id || id === 'me') {
      const current = this.authService.currentUser();
      this.profileUser.set(current);
      if (current?._id) this.loadPosts(current._id);
    } 
    // Si es un ID, buscamos al usuario
    else {
      this.usersService.getUserById(id).subscribe({
        next: (user) => {
          this.profileUser.set(user);
          this.loadPosts(user._id);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleUserStatus() {
    const user = this.profileUser();
    const currentUser = this.authService.currentUser();

    if (!user || !currentUser || currentUser.profile !== 'admin') return;

    // Evitar que el admin se borre a sí mismo
    if (user._id === currentUser._id) {
      this.modalService.show('Error', 'No puedes deshabilitar tu propia cuenta.');
      return;
    }

    const action = user.isActive
      ? this.usersService.disableUser(user._id)
      : this.usersService.restoreUser(user._id);

    action.subscribe({
      next: () => {
        // Actualizamos el estado localmente para ver el cambio en el botón
        this.profileUser.update(u => u ? ({ ...u, isActive: !u.isActive }) : null);
        this.modalService.show('Éxito', `Usuario ${user.isActive ? 'deshabilitado' : 'habilitado'} correctamente.`);
      },
      error: () => this.modalService.show('Error', 'No se pudo cambiar el estado.')
    });
  }
  
  loadPosts(userId: string) {
    this.pubService.getPublications(1, 10, { sortBy: 'new', userId: userId })
      .subscribe({
        next: (res) => {
          this.myPosts.set(res.docs);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
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
