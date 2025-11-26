import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective implements OnChanges {
  // Define la URL por defecto en una constante o propiedad privada
  private defaultUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  @Input() appImgFallback: string = ''; 
  @Input() src?: string | null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      const value = changes['src'].currentValue;
      if (!value || value.trim() === '') {
        this.setFallback();
      }
    }
  }

  @HostListener('error')
  onError() {
    this.setFallback();
  }

  private setFallback() {
    // Si appImgFallback viene vacío (porque usaste el atributo sin valor), usamos defaultUrl
    const fallback = this.appImgFallback || this.defaultUrl;

    if (this.el.nativeElement.src !== fallback) {
      this.el.nativeElement.src = fallback;
      this.el.nativeElement.srcset = '';
    }
  }
}