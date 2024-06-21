import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'option',
  standalone: true,
  imports: [],
  template: '<ng-content></ng-content>',
})
export class HTMLOptionElementWithAnyValueType {
  @Input('value') value?: any;
  @Input('ngValue') ngValue?: any;
  @Input('disabled') disabled: boolean = false;
  @Input('label') label!: string;
  @Input('selected') selected: boolean = false;

  constructor(private el: ElementRef<HTMLOptionElement>) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      if (!this.label) this.label = '' + this.el.nativeElement.textContent;
    });
    if (!this.value && this.ngValue) this.value = this.ngValue;
  }

  toString(): string {
    return this.label || '';
  }
}
