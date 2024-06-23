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
  input,
  signal,
  untracked,
  AfterContentInit,
  HostBinding,
  HostListener,
  forwardRef,
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
import { Option } from './option.directive';

@Component({
  selector: 'multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, Option],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @angular-eslint/no-forward-ref
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent
  implements ControlValueAccessor, AfterContentInit
{
  @ViewChild('dropdown') private dropdown!: ElementRef<HTMLDivElement>;
  private children: Signal<readonly Option[]> =
    contentChildren(Option);

  @Input() compareWith: (a: unknown, b: unknown) => boolean = (a, b) =>
    a?.toString() === b?.toString();

  private _disabled: WritableSignal<'' | undefined> = signal<'' | undefined>(
    undefined
  );

  public get disabled(): '' | undefined {
    return this._disabled();
  }

  @Input()
  public set disabled(value: unknown) {
    if (value !== undefined && value !== null) {
      if (value === false) this._disabled.set(undefined);
      else this._disabled.set('');
    } else this._disabled.set(undefined);
  }

  @HostBinding('attr.disabled')
  private get disabledAttribute() {
    return this.disabled;
  }

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

  // eslint-disable-next-line @angular-eslint/prefer-output-readonly
  @Output() autocomplete = new EventEmitter<string>();

  @HostBinding('class.with-autocomplete') get withAutocomplete() {
    return this.autocomplete.observed;
  }

  private _formcontrolname: string | undefined;

  @HostBinding('attr.formcontrolname')
  public get formcontrolname(): string | undefined {
    return this._formcontrolname;
  }

  public set formcontrolname(value: string | undefined) {
    this._formcontrolname = value;
    let validators: ValidatorFn | undefined;
    let asyncValidators: AsyncValidatorFn | undefined;
    if (this._formcontrolname) {
      const formControlDirective = this.formGroupDirective.directives.find(
        (directive) => directive.name === this._formcontrolname
      );
      if (formControlDirective) {
        this.formGroupDirective.removeControl(formControlDirective);
        if (formControlDirective.validator)
          validators = formControlDirective.validator;
        if (formControlDirective.asyncValidator)
          asyncValidators = formControlDirective.asyncValidator;
      }
      const oldFromControl = this.formGroupDirective.control.get(
        this._formcontrolname
      );
      const newFormControl = new FormControl<unknown[]>(
        [],
        oldFromControl?.validator,
        oldFromControl?.asyncValidator
      );
      const newFormControlName = new FormControlNameWithControl(
        this.formGroupDirective,
        validators ? [validators] : [],
        asyncValidators ? [asyncValidators] : [],
        [this],
        null,
        newFormControl
      );
      newFormControlName.name = this._formcontrolname;
      this.formGroupDirective.control.setControl(
        this._formcontrolname,
        newFormControl
      );
      this.formGroupDirective.addControl(newFormControlName);
    }
  }

  public autocompleteControl = new FormControl();

  private _isOpen: '' | undefined = undefined;

  @HostBinding('attr.open')
  public get isOpen(): '' | undefined {
    return this._isOpen;
  }

  public set isOpen(value: '' | undefined) {
    this._isOpen = value;
  }

  public nativeElement!: HTMLElement;

  public fromSelect = false;

  private _fromSelectOptions!: Signal<readonly Option[]>;

  public set fromSelectOptions(value: Signal<readonly Option[]>) {
    this._fromSelectOptions = value;
  }

  public options: WritableSignal<Option[]> = signal([]);

  protected selectedOptions: WritableSignal<Option[]> = signal([]);
  protected selectedOptionsValues!: Signal<unknown[]>;
  protected display!: Signal<string>;

  private onChange: (value: unknown) => void = () => {
    return;
  };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private formGroupDirective: FormGroupDirective,
    private injector: Injector
  ) {
    this.nativeElement = this.elementRef.nativeElement;
    effect(() => {
      this.onChange(this.selectedOptionsValues());
    });
    effect(() => {
      if (this.dropdown) {
        if (this._disabled() !== undefined) {
          this.isOpen = undefined;
        }
      }
    });
    this.autocompleteControl.valueChanges.subscribe((value) => {
      this.autocomplete.emit(value);
    });
  }

  public writeValue(values: unknown[]): void {
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
      const selectedOptions = this.options().filter(
        (option) => option.selected
      );
      this.selectedOptions.set(selectedOptions);
    }
  }

  public registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => unknown): void {
    fn();
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled ? '' : undefined;
  }

  public ngAfterContentInit(): void {
    effect(
      () => {
        let options;
        if (!this.fromSelect) options = this.children();
        else options = this._fromSelectOptions();
        setTimeout(() => {
          const map = new Map<string, Option>();
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
      const options = this.selectedOptions();
      return options.map((option) => option.value);
    });
    this.display = computed(() => {
      const options = this.selectedOptions();
      return options.map((option) => option.toString()).join(', ');
    });
    effect(
      () => {
        const options = this.options();
        const oldSelectedOptions = untracked(this.selectedOptions);
        const oldSelectedOptionsLabels = oldSelectedOptions.map<string>(
          (option) => option.label
        );
        options.forEach((option) => {
          if (oldSelectedOptionsLabels.includes(option.label))
            option.selected = true;
        });
        const newSelectedOptions = options.filter((option) => option.selected);
        const combinedSelectedOptions =
          oldSelectedOptions.concat(newSelectedOptions);
        const map = new Map<string, Option>();
        combinedSelectedOptions.forEach((option) => {
          map.set(option.label, option);
        });
        this.selectedOptions.set(Array.from(map.values()));
      },
      { allowSignalWrites: true, injector: this.injector }
    );
  }

  protected onSelectOption(event: Event, optionToChangeSelect: Option): void {
    event.stopPropagation();
    console.log(optionToChangeSelect);
    optionToChangeSelect.selected = !optionToChangeSelect.selected;
    const oldSelectedOptions = this.selectedOptions();
    const map = new Map<string, Option>();
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

  @HostListener('click')
  protected dorpdown(): void {
    if (this.disabled === undefined) {
      this.isOpen = this.isOpen === '' ? undefined : '';
    }
  }
}

class FormControlNameWithControl<T = unknown> extends FormControlName {
  constructor(
    parent: ControlContainer,
    validators: (ValidatorFn | Validator)[],
    asyncValidators: (AsyncValidatorFn | AsyncValidator)[],
    valueAccessors: ControlValueAccessor[],
    _ngModelWarningConfig: string | null,
    control: FormControl<T>
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
  override control: FormControl<T>;
}
