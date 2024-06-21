import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
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
  untracked,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.formcontrolname]': '_formcontrolname',
    '[class.with-autocomplete]': 'autocomplete.observed',
    '[attr.aria]': 'true'
  },
})
export class MultiSelectComponent implements ControlValueAccessor {
  private children: Signal<readonly Option[]> = contentChildren(
    HTMLOptionElementWithAnyValueType
  );

  @Input('compareWith') compareWith: (a: unknown, b: unknown) => boolean = (a, b) =>
    a?.toString() === b?.toString();

  @ViewChild('dropdown') dropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('dropdown_toggler')
  dropdownToggler!: ElementRef<HTMLButtonElement>;

  fromSelect: boolean = false;

  fromSelectOptions!: Signal<readonly Option[]>;

  public options: WritableSignal<Option[]> = signal([]);

  protected selectedOptions: WritableSignal<Option[]> = signal([]);
  protected selectedOptionsValues!: Signal<unknown[]>;
  private _formcontrolname: string | undefined;
  private newFormControl: FormControl | undefined;

  protected display!: Signal<string>;

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

  private onChange: (value: unknown) => void = () => {};
  disabled = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });
  required = input(false, {
    alias: 'required',
    transform: booleanAttribute,
  });
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

  @Output() autocomplete = new EventEmitter<string>();
  autocompleteControl = new FormControl();

  isDisabled: WritableSignal<boolean> = signal<boolean>(this.disabled());

  checkUpdated: boolean = false;

  nativeElement!: HTMLElement;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private formGroupDirective: FormGroupDirective,
    private injector: Injector
  ) {
    this.nativeElement = elementRef.nativeElement;
    console.log(this.nativeElement);
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
        if (this.isDisabled()) {
          this.dropdown.nativeElement.removeAttribute('open');
          this.dropdownToggler.nativeElement.removeAttribute('active');
        }
      }
    });
    this.autocompleteControl.valueChanges.subscribe((value) => {
      this.autocomplete.emit(value);
    });
  }

  writeValue(values: unknown[]): void {
    if (this.options && this.selectedOptions) {
      if (!Array.isArray(values)) {
        this.options().forEach((option) => {
          if (this.compareWith(option.value, values)) option.selected = true;
          else option.selected = false;
        });
      } else {
        this.options().forEach((option) => {
          option.selected = values.some((value) =>
            this.compareWith(option.value, value)
          );
        });
      }
      let selectedOptions = this.options().filter((option) => option.selected);
      this.selectedOptions.set(selectedOptions);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    fn();
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  ngAfterContentInit(): void {
    effect(
      () => {
        let options;
        if (!this.fromSelect) options = this.children();
        else options = this.fromSelectOptions();
        setTimeout(() => {
          let map = new Map<string, Option>();
          options.forEach((option) => {
            if (map.has(option.label))
              console.error(
                'Duplicated label found.\nDuplicate: %o\n\nOriginal: %o\n\nOptions will display only distinct label to avoid confusion for the user.',
                option,
                map.get(option.label)
              );
            map.set(option.label, option);
          });
          this.options.set(Array.from(map.values()));
        }, 10);
      },
      { allowSignalWrites: true, injector: this.injector }
    );
    this.selectedOptionsValues = computed(() => {
      let options = this.selectedOptions();
      return options.map((option) => option.value);
    });
    this.display = computed(() => {
      let options = this.selectedOptions();
      return options.map((option) => option.toString()).join(', ');
    });
    effect(
      () => {
        let options = this.options();
        setTimeout(() => {
          let oldSelectedOptions = untracked(this.selectedOptions);
          let oldSelectedOptionsLabels = oldSelectedOptions.map<string>(
            (option) => option.label
          );
          options.forEach((option) => {
            if (oldSelectedOptionsLabels.includes(option.label))
              option.selected = true;
          });
          let newSelectedOptions = options.filter((option) => option.selected);
          let combinedSelectedOptions =
            oldSelectedOptions.concat(newSelectedOptions);
          let map = new Map<string, Option>();
          combinedSelectedOptions.forEach((option) => {
            map.set(option.label, option);
          });
          this.selectedOptions.set(Array.from(map.values()));
        }, 10);
      },
      { allowSignalWrites: true, injector: this.injector }
    );
  }

  onSelectOption(optionToChangeSelect: Option) {
    optionToChangeSelect.selected = !optionToChangeSelect.selected;
    let oldSelectedOptions = this.selectedOptions();
    let map = new Map<string, Option>();
    oldSelectedOptions.forEach((option) => {
      map.set(option.label, option);
    });
    if (map.has(optionToChangeSelect.label) && !optionToChangeSelect.selected) {
      map.delete(optionToChangeSelect.label);
    }
    if (!map.has(optionToChangeSelect.label) && optionToChangeSelect.selected) {
      map.set(optionToChangeSelect.label, optionToChangeSelect);
    }
    this.selectedOptions.set(Array.from(map.values()));
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
  override control: FormControl<unknown>;
}
