import { Component, WritableSignal, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MultiSelectModule } from '../multi-select/multi-select.module';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Option {
  label: string;
  value: unknown;
  selected: boolean;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-main',
  standalone: true,
  imports: [
    MultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    JsonPipe,
    RouterLink,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  options: Option[] = [
    { label: 'picone', value: 1, selected: true },
    { label: 'carlo', value: undefined, selected: true },
    {
      label: 'giorgio',
      value: { id: 3, content: NaN, toString: this.tostring },
      selected: false,
    },
    { label: 'luca', value: () => 'picone', selected: false },
    { label: 'luigi', value: 'piccione', selected: false },
    {
      label: 'giorgione',
      value: { id: 6, content: undefined, toString: this.tostring },
      selected: false,
    },
    {
      label: 'ilario',
      value: { id: 7, content: () => 'test', toString: this.tostring },
      selected: false,
    },
  ];

  group = new FormGroup({
    first: new FormControl([]),
  });

  tostring(this: Record<string, unknown>) {
    return this['id'];
  }

  formValues: WritableSignal<object | undefined> = signal(undefined);

  formDisplay(): void {
    this.formValues.set(this.group.getRawValue());
  }

  isDisabled = false;

  patchValues(): void {
    const first = this.group.get('first');
    first?.reset();
  }

  initialOptions: Option[] = [];

  ngOnInit(): void {
    this.initialOptions = this.options;
  }

  onAutocomplete(string: string): void {
    this.options = this.initialOptions.filter((option) =>
      option.label
        .toLocaleLowerCase()
        .includes(string.trim().toLocaleLowerCase())
    );
  }

  switchDisable() {
    const first = this.group.get('first');
    if (first?.enabled) first?.disable();
    else first?.enable();
  }
}
