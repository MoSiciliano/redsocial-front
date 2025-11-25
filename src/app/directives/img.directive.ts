import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective implements OnChanges {
  // 1. Recibimos la URL del fallback (opcional, si no usa la de assets)
  @Input() appImgFallback = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  // 2. Interceptamos el valor del 'src' original para analizarlo
  @Input() src?: string | null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  // Se ejecuta cada vez que cambia el [src] en el HTML
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      const value = changes['src'].currentValue;

      // Si el valor es nulo, undefined o string vacío... ponemos el default directo
      if (!value || value.trim() === '') {
        this.setFallback();
      }
    }
  }

  // Se ejecuta si el navegador intenta cargar la imagen y falla (404)
  @HostListener('error')
  onError() {
    this.setFallback();
  }

  private setFallback() {
    // Evitamos bucles infinitos validando que no sea ya la imagen de fallback
    if (
      this.el.nativeElement.src !== this.appImgFallback &&
      !this.el.nativeElement.src.endsWith(this.appImgFallback)
    ) {
      this.el.nativeElement.src = this.appImgFallback;

      // Si quieres asegurarte, puedes forzar quitar el 'srcset' si usaras responsive images
      this.el.nativeElement.srcset = '';
    }
  }
}
