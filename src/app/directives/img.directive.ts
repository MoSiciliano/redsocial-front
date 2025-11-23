import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]', // El selector para usarla en el HTML
  standalone: true // Importante para Angular moderno
})
export class ImgFallbackDirective {
  
  @Input() appImgFallback = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  constructor(private el: ElementRef) {}
  @HostListener('error')
  onError() {
    this.el.nativeElement.src = this.appImgFallback;
  }
}