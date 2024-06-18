import {
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  contentChildren,
  effect,
  forwardRef,
  signal,
} from '@angular/core';
import { HTMLOptionElementWithAnyValueType } from './option.directive';
import {
  AsyncValidator,
  AsyncValidatorFn,
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, HTMLOptionElementWithAnyValueType],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.formcontrolname]': '_formcontrolname',
  },
})
export class MultiSelectComponent implements ControlValueAccessor {
  
  private children: Signal<readonly HTMLOptionElementWithAnyValueType[]> = contentChildren(HTMLOptionElementWithAnyValueType); 

  @ViewChild('dropdown') dropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('dropdown_toggler') dropdownToggler!: ElementRef<HTMLButtonElement>;

  fromSelect: boolean = false;

  fromSelectOptions!: Signal<readonly HTMLOptionElementWithAnyValueType[]>;

  public options: Signal<readonly HTMLOptionElementWithAnyValueType[]> = signal([]);

  protected selectedOptions: WritableSignal<
    HTMLOptionElementWithAnyValueType[]
  > = signal([]);
  protected selectedOptionsValues: Signal<any[]> = computed(() => {
    let options = this.selectedOptions();
    return options.map((option) => option.value);
  });
  private _formcontrolname?: string | undefined;
  private formControl?: FormControl | undefined;

  protected display: Signal<string> = computed(() => {
    let options = this.selectedOptions();
    return options.map((option) => option.toString()).join(', ');
  });

  public set formcontrolname(value: string | undefined) {
    this._formcontrolname = value;
    if (this._formcontrolname) {
      let formControlDirective = this.formGroupDirective.directives.find(
        (directive) => directive.name === this._formcontrolname
      );
      if (formControlDirective) {
        this.formGroupDirective.removeControl(formControlDirective);
      }
      this.formGroupDirective.control.removeControl(this._formcontrolname);
      this.formControl = new FormControl([]);
      let formcontrolnamessss = new FormControlNameWithControl(
        this.formGroupDirective,
        [],
        [],
        [this],
        null,
        this.formControl
      );
      this.formGroupDirective.control.addControl(
        this._formcontrolname,
        this.formControl
      );
      formcontrolnamessss.name = this._formcontrolname;
      this.formGroupDirective.addControl(formcontrolnamessss);
    }
  }

  private onChange: (value: any) => void = () => {};

  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private formGroupDirective: FormGroupDirective
  ) {
    effect(() => {
      this.onChange(this.selectedOptionsValues());
    });
  }

  writeValue(obj: any): void {
    console.log('writeValue', obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {}

  ngAfterContentInit(): void {
    this.options = computed(() => {
      if (!this.fromSelect) return this.children();
      return this.fromSelectOptions();
    })
  }

  onSelectOption(option: HTMLOptionElementWithAnyValueType) {
    option.selected = !option.selected;
    this.selectedOptions.set(
      this.options().filter((option) => option.selected)
    );
  }

  dorpdown($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dropdown.nativeElement.toggleAttribute('open');
    this.dropdownToggler.nativeElement.toggleAttribute('active');
  }

}

class FormControlNameWithControl extends FormControlName {
  constructor(
    parent: ControlContainer,
    validators: (ValidatorFn | Validator)[],
    asyncValidators: (AsyncValidatorFn | AsyncValidator)[],
    valueAccessors: ControlValueAccessor[],
    _ngModelWarningConfig: string | null,
    control: FormControl<unknown>
  ) {
    super(
      parent,
      validators,
      asyncValidators,
      valueAccessors,
      _ngModelWarningConfig
    );
    this.control = control;
  }
  override control: FormControl<any>;
}
