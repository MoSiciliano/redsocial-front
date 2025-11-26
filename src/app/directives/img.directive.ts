import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective implements OnChanges {
  private defaultUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  @Input() appImgFallback: string = ''; 
  @Input() src?: string | null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      const value = changes['src'].currentValue;

      // CASO 1: Viene vacío o nulo -> Ponemos el Fallback
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.setFallback();
      } 
      // CASO 2: Viene una URL válida -> Forzamos que se ponga en la imagen
      else {
        this.el.nativeElement.src = value;
      }
    }
  }

  @HostListener('error')
  onError() {
    this.setFallback();
  }

  private setFallback() {
    const fallback = this.appImgFallback || this.defaultUrl;
    // Solo lo cambiamos si no es ya el fallback (para evitar bucles infinitos)
    if (this.el.nativeElement.src !== fallback) {
      this.el.nativeElement.src = fallback;
      this.el.nativeElement.srcset = ''; // Limpiamos srcset por si acaso
    }
  }
}