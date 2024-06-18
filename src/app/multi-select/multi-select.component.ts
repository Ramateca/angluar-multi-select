import {
  Attribute,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  WritableSignal,
  effect,
  forwardRef,
  signal,
} from '@angular/core';
import { OptionDirective } from './option.directive';
import {
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';

@Component({
  selector: 'multi-select',
  standalone: true,
  imports: [],
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
    '[prop.formcontrolname]': '_formcontrolname',
    '[attr.formcontrol]': 'formControl',
    '[prop.formcontrol]': 'formControl',
  },
})
export class MultiSelectComponent implements ControlValueAccessor {
  @ContentChildren(OptionDirective, { read: ElementRef<HTMLElement> })
  private children!: QueryList<ElementRef<HTMLElement>>;
  public options: WritableSignal<HTMLOptionElement[]> = signal([]);
  private selectedOptions: WritableSignal<unknown[]> = signal<unknown[]>([]);
  private _formcontrolname?: string | undefined;
  private _formControl?: FormControl | undefined;

  public set formControl(value: FormControl | undefined) {
    this._formControl = value;
  }

  public set formcontrolname(value: string | undefined) {
    this._formcontrolname = value;
    if (this._formcontrolname) {
      let formControlDirective = this.formGroupDirective.directives.find(
        (directive) => directive.name === this._formcontrolname
      );
      if (formControlDirective) {
        this.formGroupDirective.control.removeControl(this._formcontrolname);
        // let formcontrolnamessss = new FormControlName(
        //   this.formGroupDirective,
        //   [],
        //   [],
        //   [this],
        //   null
        // );
        // console.log(formcontrolnamessss);
        this._formControl = new FormControl([]);
        this.formGroupDirective.control.addControl(
          this._formcontrolname,
          this._formControl
        );
        // formcontrolnamessss.name = this._formcontrolname;
        // this.formGroupDirective.addControl(formcontrolnamessss);
        // console.log(this.formGroupDirective);
      }
    }
  }

  private onChange: (value: any) => void = () => {};

  constructor(
    private select: ElementRef<HTMLSelectElement>,
    private formGroupDirective: FormGroupDirective
  ) {
    effect(() => {
      console.log(this.selectedOptions());
      this.onChange(this.selectedOptions());
    });
  }

  writeValue(obj: any): void {
    if (Array.isArray(obj)) this.selectedOptions.set(obj);
    else this.selectedOptions.set([obj]);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {}

  ngAfterContentInit(): void {
    if (this.options().length === 0) {
      this.options.set(
        this.children
          .toArray()
          .map((el) => el.nativeElement)
          .filter(
            (el) => el instanceof HTMLOptionElement
          ) as HTMLOptionElement[]
      );
    }
  }

  onSelectOption($event: MouseEvent) {
    this.selectedOptions.update((options) => {
      options.push(($event.target as HTMLOptionElement).value);
      return options;
    });
  }
}
