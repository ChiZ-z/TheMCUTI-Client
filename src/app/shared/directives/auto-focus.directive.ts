import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[tmcAutoFocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
