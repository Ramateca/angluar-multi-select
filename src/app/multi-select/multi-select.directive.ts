import {
  AfterViewChecked,
  Directive,
  ElementRef,
  QueryList,
  ViewContainerRef,
} from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
@Directive({
  selector: 'select[multiple]',
  standalone: true,
})
export class MultiSelectDiverctive {
  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngAfterContentInit(): void {
    let template = this.select.nativeElement;
    let optionsTotransfer: HTMLOptionElement[] = []
    for (let index = 0; index < template.children.length; index++) {
      const element = template.children.item(index);
      if (element && element instanceof HTMLOptionElement) optionsTotransfer.push(element);
    }
    if (template) {
      let multiSelect = this.viewContainerRef.createComponent(MultiSelectComponent);
      multiSelect.instance.options.set(optionsTotransfer);
      this.select.nativeElement.parentNode?.removeChild(template);
    }
  }
}
