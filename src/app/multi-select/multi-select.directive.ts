import {
  Directive,
  ElementRef,
  Input,
  InputSignal,
  Signal,
  ViewContainerRef,
  booleanAttribute,
  contentChildren,
  effect,
  input,
} from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { HTMLOptionElementWithAnyValueType } from './option.directive';

@Directive({
  selector: 'select[multiple]',
  standalone: true,
})
export class MultiSelectDiverctive {
  private options: Signal<readonly HTMLOptionElementWithAnyValueType[]> =
    contentChildren(HTMLOptionElementWithAnyValueType);
  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private viewContainerRef: ViewContainerRef
  ) {}
  isRequired = input(false, { alias: 'required', transform: booleanAttribute });
  isDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });

  ngAfterContentInit(): void {
    let template = this.select.nativeElement;
    let maybeFormControlName: string | null =
      template.getAttribute('formControlName');
    if (template) {
      let multiSelect =
        this.viewContainerRef.createComponent(MultiSelectComponent);
      multiSelect.instance.fromSelect = true;
      multiSelect.instance.required = this.isRequired;
      multiSelect.instance.disabled = this.isDisabled;
      multiSelect.instance.fromSelectOptions = this.options;
      if (maybeFormControlName && maybeFormControlName.trim() !== '')
        multiSelect.instance.formcontrolname = maybeFormControlName;
      this.select.nativeElement.parentNode?.removeChild(template);
    }
  }
}
