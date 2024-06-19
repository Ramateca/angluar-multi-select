import {
  Attribute,
  Component,
  ElementRef,
  Input,
  InputSignal,
  Signal,
  ViewChild,
  WritableSignal,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
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
import { HTMLOptionElementWithAnyValueType } from './option.directive';

type Option = HTMLOptionElementWithAnyValueType;

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
  @ViewChild('dropdown_toggler')
  dropdownToggler!: ElementRef<HTMLButtonElement>;

  fromSelect: boolean = false;

  fromSelectOptions!: Signal<readonly Option[]>;

  public options: Signal<readonly Option[]> = signal([]);

  protected selectedOptions: WritableSignal<Option[]> = signal([]);
  protected selectedOptionsValues: Signal<any[]> = computed(() => {
    let options = this.selectedOptions();
    return options.map((option) => option.value);
  });
  private _formcontrolname: string | undefined;
  private newFormControl: FormControl | undefined;

  protected display: Signal<string> = computed(() => {
    let options = this.selectedOptions();
    return options.map((option) => option.toString()).join(', ');
  });

  public set formcontrolname(value: string | undefined) {
    this._formcontrolname = value;
    let validators: ValidatorFn = () => null;
    let asyncValidators: AsyncValidatorFn = async () => null;
    if (this._formcontrolname) {
      let formControlDirective = this.formGroupDirective.directives.find(
        (directive) => directive.name === this._formcontrolname
      );
      if (formControlDirective) {
        this.formGroupDirective.removeControl(formControlDirective);
        if (formControlDirective.validator)
          validators = formControlDirective.validator;
        if (formControlDirective.asyncValidator)
          asyncValidators = formControlDirective.asyncValidator;
      }
      let oldFromControl = this.formGroupDirective.control.get(
        this._formcontrolname
      );
      this.formGroupDirective.control.removeControl(this._formcontrolname);
      this.newFormControl = new FormControl(
        [],
        oldFromControl?.validator,
        oldFromControl?.asyncValidator
      );
      let newFormControlName = new FormControlNameWithControl(
        this.formGroupDirective,
        [validators],
        [asyncValidators],
        [this],
        null,
        this.newFormControl
      );
      this.formGroupDirective.control.addControl(
        this._formcontrolname,
        this.newFormControl
      );
      newFormControlName.name = this._formcontrolname;
      this.formGroupDirective.addControl(newFormControlName);
    }
  }

  private onChange: (value: any) => void = () => {};
  disabled = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });
  required = input(false, {
    alias: 'required',
    transform: booleanAttribute,
  });

  isDisabled: WritableSignal<boolean> = signal<boolean>(this.disabled());

  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private formGroupDirective: FormGroupDirective
  ) {
    effect(() => {
      this.onChange(this.selectedOptionsValues());
    });
    effect(
      () => {
        let disabled = this.disabled();
        this.isDisabled.set(disabled);
      },
      { allowSignalWrites: true }
    );
    effect(() => {
      if (this.dropdown) {
        if(this.isDisabled()) {
          this.dropdown.nativeElement.removeAttribute("open");
          this.dropdownToggler.nativeElement.removeAttribute("active");
        }
      }
    })
  }

  writeValue(values: any[]): void {
    this.options().forEach((option) => {
      const isValueIncluded: boolean = values.includes(option.value);
      if (isValueIncluded) option.selected = true;
      else option.selected = false;
    });
    this.selectedOptions.set(
      this.options().filter((option) => option.selected)
    );
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    return;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  ngAfterContentInit(): void {
    this.options = computed(() => {
      if (!this.fromSelect) return this.children();
      return this.fromSelectOptions();
    });
  }

  onSelectOption(option: Option) {
    option.selected = !option.selected;
    this.selectedOptions.set(
      this.options().filter((option) => option.selected)
    );
  }

  dorpdown($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    if (!this.isDisabled()) {
      this.dropdown.nativeElement.toggleAttribute('open');
      this.dropdownToggler.nativeElement.toggleAttribute('active');
    }
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
