import type { OnInit, AfterContentInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from '../multi-select/multi-select.module';

interface Option {
  label: string;
  value: unknown;
  selected: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-test-view',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './test-view.component.html',
  styleUrl: './test-view.component.scss',
})
export class TestViewComponent implements OnInit, AfterContentInit {
  public options: readonly Option[] = [
    { label: 'picone', value: 1, selected: false },
    { label: 'picone', value: 1, selected: true },
    { label: 'carlo', value: undefined, selected: true },
    {
      label: 'giorgio',
      value: { id: 3, content: NaN },
      selected: false
    },
    { label: 'luca', value: () => 'picone',selected: false },
    { label: 'luigi', value: 'piccione',selected: false },
    {
      label: 'giorgione',
      value: { id: 6, content: undefined },
      selected: false
    },
    {
      label: 'ilario',
      value: { id: 7, content: () => 'test' },
      selected: false
    },
  ];

  public group!: FormGroup;

  public isDisabled = false;

  public initialOptions: readonly Option[] = [];

  public ngOnInit(): void {
    this.initialOptions = this.options;
  }

  public ngAfterContentInit(): void {
    this.group = new FormGroup({
      first: new FormControl<unknown[]>([]),
    });
  }

  public onAutocomplete(string: string): void {
    this.options = this.initialOptions.filter((option: Readonly<Option>) =>
      option.label.toLocaleLowerCase().includes(string.trim().toLocaleLowerCase())
    );
  }
}
