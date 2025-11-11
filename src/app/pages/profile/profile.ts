import { Component, OnInit, inject, signal } from '@angular/core'; // <-- 1. Importa OnInit, signal
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicationsService } from '../../services/publications.service'; // <-- 2. Importa el servicio de Pubs
import { Publication } from '../../models/publication'; // <-- 3. Importa el modelo
import { NavbarComponent } from '../../components/nav/nav';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent], // (Luego agregaremos el PostItem)
  templateUrl: './profile.html',
})
export class Profile implements OnInit { // <-- 4. Implementa OnInit
  
  // --- Inyección de Servicios ---
  authService = inject(AuthService); // Ya lo tenías
  private pubService = inject(PublicationsService); // <-- 5. Inyecta el servicio

  // --- Señales de Estado ---
  myPosts = signal<Publication[]>([]); // <-- 6. Señal para guardar los posts
  isLoading = signal(true); // Señal para el "Cargando..."

  // El currentUser() ya lo provee el authService

  ngOnInit() {
    this.loadMyPosts();
  }

  loadMyPosts() {
    this.isLoading.set(true);
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      console.error('No se pudo encontrar el usuario para cargar el perfil.');
      this.isLoading.set(false);
      return;
    }

    const userId = currentUser._id;

    // --- 7. ¡LA LLAMADA CLAVE! ---
    // Llamamos al 'getPublications' que ya existe, pero con
    // los parámetros para "Mi Perfil":
    this.pubService.getPublications(
      1,          // 1ra página
      3,          // Límite de 3 (como pide el TP)
      'new',      // Ordenados por 'new' (los más nuevos)
      userId      // ¡Filtrados por nuestro userId!
    ).subscribe({
      next: (res) => {
        this.myPosts.set(res.docs); // Guardamos los 3 posts
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar mis publicaciones:', err);
        this.isLoading.set(false);
      },
    });
  }
}