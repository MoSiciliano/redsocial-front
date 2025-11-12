import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicationsService, SortByType } from '../../services/publications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  pubService = inject(PublicationsService);
  private router = inject(Router);
  
  isSortMenuOpen = signal(false);

  logout() {
    this.authService.logout();
  }
  selectSort(sort: SortByType){
    this.pubService.changeSort(sort); // Llama al servicio
    this.isSortMenuOpen.set(false); // Cierra el menú
    
    this.router.navigate(['/posts']);
  }
}