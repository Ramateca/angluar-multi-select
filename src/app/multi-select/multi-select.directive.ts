import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Signal,
  ViewContainerRef,
  booleanAttribute,
  contentChildren,
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
  placeholder = input('', {
    alias: 'placeholer',
    transform: (value: any) => {
      switch (typeof value) {
        case 'string': return value;
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'object': return value.toString();
        case 'function': return value().toString();
        case 'symbol': return value.toString().replace(/Symbol\((.*)\)/, "$1");
        case 'undefined': return "";
      }
    },
  });
  @Output() autocomplete = new EventEmitter<string>();
  @Input('compareWith') compareWith: (a: any, b: any) => boolean = (a, b) =>
    a?.toString() === b?.toString();

  ngOnInit(): void {
    let template = this.select.nativeElement;
    let maybeFormControlName: string | null =
      template.getAttribute('formControlName');
    if (template) {
      let multiSelect =
        this.viewContainerRef.createComponent(MultiSelectComponent);
      multiSelect.instance.fromSelect = true;
      multiSelect.instance.required = this.isRequired;
      multiSelect.instance.disabled = this.isDisabled;
      multiSelect.instance.placeholder = this.placeholder;
      multiSelect.instance.fromSelectOptions = this.options;
      multiSelect.instance.compareWith = this.compareWith;
      multiSelect.instance.autocomplete = this.autocomplete;
      if (maybeFormControlName && maybeFormControlName.trim() !== '')
        multiSelect.instance.formcontrolname = maybeFormControlName;
      this.select.nativeElement.parentNode?.removeChild(template);
    }
  }
}