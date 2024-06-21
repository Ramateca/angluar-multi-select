import { Component, WritableSignal, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MultiSelectModule } from '../multi-select/multi-select.module';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MultiSelectModule, ReactiveFormsModule, FormsModule, JsonPipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  options: { label: string; value: any; selected: boolean }[] = [
    { label: 'picone', value: 1, selected: false },
    { label: 'picone', value: 1, selected: true },
    { label: 'carlo', value: undefined, selected: true },
    {
      label: 'giorgio',
      value: { id: 3, content: NaN, toString: this.tostring },
      selected: false
    },
    { label: 'luca', value: () => 'picone',selected: false },
    { label: 'luigi', value: 'piccione',selected: false },
    {
      label: 'giorgione',
      value: { id: 6, content: undefined, toString: this.tostring },
      selected: false
    },
    {
      label: 'ilario',
      value: { id: 7, content: () => 'test', toString: this.tostring },
      selected: false
    },
  ];

  group!: FormGroup;

  tostring(this: any) {
    return this.id;
  }

  formValues: WritableSignal<Object | undefined> = signal(undefined);

  formDisplay(): void {
    this.formValues.set(this.group.getRawValue());
  }

  isDisabled: boolean = false;

  patchValues(): void {
    let first = this.group.get('first');
    first?.reset();
  }

  initialOptions: { label: string; value: any, selected: boolean }[] = [];

  ngOnInit(): void {
    this.initialOptions = this.options;
  }

  ngAfterContentInit(): void {
    this.group = new FormGroup({
      first: new FormControl<any[]>([]),
    });
  }

  onAutocomplete(string: string): void {
    this.options = this.initialOptions.filter((option) =>
      option.label.toLocaleLowerCase().includes(string.trim().toLocaleLowerCase())
    );
  }

  switchDisable() {
    let first = this.group.get('first');
    if (first?.enabled) first?.disable();
    else first?.enable();
  }
}
