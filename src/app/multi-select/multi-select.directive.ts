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
  input, OnInit,
} from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { OptionDirective } from './option.directive';

@Directive({
  selector: 'select[multiple]',
  standalone: true,
})
export class MultiSelectDiverctive implements OnInit {
  private options: Signal<readonly OptionDirective[]> =
    contentChildren(OptionDirective);
  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private viewContainerRef: ViewContainerRef
  ) {}
  isRequired = input(false, { alias: 'required', transform: booleanAttribute });
  isDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });
  placeholder = input('', {
    alias: 'placeholer',
    transform: (value: unknown) => {
      switch (typeof value) {
        case 'string':
          return value;
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'object':
          return value !== null ? value.toString() : '';
        case 'function':
          return value().toString();
        case 'symbol':
          return value.toString().replace(/Symbol\((.*)\)/, '$1');
        case 'undefined':
          return '';
      }
    },
  });
  
  @Output() readonly autocomplete = new EventEmitter<string>();
  @Input() compareWith: (a: unknown, b: unknown) => boolean = (a, b) =>
    a?.toString() === b?.toString();

  ngOnInit(): void {
    const template = this.select.nativeElement;
    const maybeFormControlName: string | null =
      template.getAttribute('formControlName');
    if (template) {
      const multiSelect =
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
