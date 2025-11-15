import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ModalComponent } from './components/modal/modal';
import { NavbarComponent } from './components/nav/nav';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importa el RouterOutlet y tu ModalComponent global
  imports: [CommonModule, RouterOutlet, ModalComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  isLoadingRoute = signal(false);
  private router = inject(Router);

  constructor() {
    //  Escucha los eventos del router para activar el spinner
    this.router.events.pipe(
      filter(e => 
        e instanceof NavigationStart || 
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ),
      map(e => e instanceof NavigationStart)
    ).subscribe(isLoading => {
      this.isLoadingRoute.set(isLoading); 
    });
  }
}
