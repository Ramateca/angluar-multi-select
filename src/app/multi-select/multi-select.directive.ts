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
    let maybeFormControlName: string | null = template.getAttribute("formControlName");
    for (let index = 0; index < template.children.length; index++) {
      const element = template.children.item(index);
      if (element && element instanceof HTMLOptionElement) optionsTotransfer.push(element);
    }
    if (template) {
      let multiSelect = this.viewContainerRef.createComponent(MultiSelectComponent);
      multiSelect.instance.options.set(optionsTotransfer);
      if (maybeFormControlName && maybeFormControlName.trim() !== "") multiSelect.instance.formcontrolname = maybeFormControlName;
      this.select.nativeElement.parentNode?.removeChild(template);
    }
  }
}
