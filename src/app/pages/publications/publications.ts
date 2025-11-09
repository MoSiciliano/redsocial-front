import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/nav/nav';
import { Publication } from '../../models/publication';
import { CreatePost } from '../../components/create-post/create-post';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CreatePost],
 templateUrl: 'publications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Publications {
  onPostCreado(newPost: Publication) {
    console.log('¡Nuevo post creado!:', newPost);
    // (Próximamente) Acá lo agregaríamos al inicio de la señal de 'posts'
    // this.posts.update(listaActual => [newPost, ...listaActual]);
  }
}