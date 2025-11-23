import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { PublicationsService, SortByType } from '../../services/publications.service';
import { UsersService } from '../../services/users.service';
import { FilterPipe } from '../../pipes/filter.pipe';
import { ImgFallbackDirective } from '../../directives/img.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FilterPipe, ImgFallbackDirective],
  templateUrl: './nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  usersService = inject(UsersService); // Inyectamos
  pubService = inject(PublicationsService);
  private router = inject(Router);
  
  currentUser = this.authService.currentUser;
  isSortMenuOpen = signal(false);
  
  // Variables para el buscador
  searchTerm = signal('');
  allUsers = signal<any[]>([]); 

  ngOnInit() {
    // Cargamos los usuarios al iniciar para tenerlos listos en el buscador
    if (this.currentUser()) {
      this.usersService.getUsers().subscribe(users => {
        this.allUsers.set(users);
      });
    }
  }

  logout() {
    this.authService.logout();
  }
  
  selectSort(sort: SortByType){
    this.pubService.changeSort(sort);
    this.isSortMenuOpen.set(false);
    this.router.navigate(['/posts']);
  }

  // Acción al hacer click en un resultado
  goToProfile(userId: string) {
    this.searchTerm.set(''); // Limpiar búsqueda
    this.router.navigate(['/profile', userId]);
  }
}