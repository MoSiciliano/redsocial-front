import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  // 1. La URL del fantasmita por defecto
  private defaultUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  
  // Variable interna para controlar qué mostramos
  private currentSrc: string = this.defaultUrl;

  @Input() appImgFallback: string = '';

  // 2. Interceptamos el [src] del HTML.
  // Usamos un 'set' para reaccionar apenas cambia el valor.
  @Input()
  set src(value: string | null | undefined) {
    // Si el valor es inválido (nulo o vacío), mostramos el fallback
    if (!value || value.trim() === '') {
      this.updateSrc(this.getFallbackUrl());
    } else {
      // Si es válido, intentamos mostrar esa imagen
      this.updateSrc(value);
    }
  }

  // 3. ¡Esta es la clave! Vinculamos nuestra variable interna al atributo 'src' real del elemento.
  // Angular se encarga de mantenerlo actualizado.
  @HostBinding('src')
  get displayedImage(): string {
    return this.currentSrc;
  }

  // 4. Si el navegador intenta cargar la imagen y falla (404)...
  @HostListener('error')
  onError() {
    // ...forzamos el fallback
    this.updateSrc(this.getFallbackUrl());
  }

  private updateSrc(newSrc: string) {
    if (this.currentSrc !== newSrc) {
      this.currentSrc = newSrc;
    }
  }

  private getFallbackUrl(): string {
    return this.appImgFallback || this.defaultUrl;
  }
}