import {
  AfterViewChecked,
  ContentChildren,
  Directive,
  ElementRef,
  QueryList,
  Signal,
  ViewContainerRef,
  contentChildren,
} from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { HTMLOptionElementWithAnyValueType } from './option.directive';

@Directive({
  selector: 'select[multiple]',
  standalone: true,
})
export class MultiSelectDiverctive {
  private options: Signal<readonly HTMLOptionElementWithAnyValueType[]>= contentChildren(HTMLOptionElementWithAnyValueType); 
  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngAfterContentInit(): void {
    let template = this.select.nativeElement;
    let maybeFormControlName: string | null = template.getAttribute("formControlName");
    if (template) {
      let multiSelect = this.viewContainerRef.createComponent(MultiSelectComponent);
      multiSelect.instance.fromSelect = true;
      multiSelect.instance.fromSelectOptions = this.options;
      if (maybeFormControlName && maybeFormControlName.trim() !== "") multiSelect.instance.formcontrolname = maybeFormControlName;
      this.select.nativeElement.parentNode?.removeChild(template);
    }
  }
}
