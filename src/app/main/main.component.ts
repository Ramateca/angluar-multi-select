import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from '../multi-select/multi-select.module';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MultiSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  options: { label: string; value: unknown }[] = [
    { label: 'picone', value: 1 },
    { label: 'carlo', value: 2 },
    { label: 'giorgio', value: 3 },
    { label: 'luca', value: 4 },
    { label: 'luigi', value: 5 },
    { label: 'giorgione', value: 6 },
    { label: 'ilario', value: 7 },
  ];

  group = new FormGroup({
    first: new FormControl([]),
    last: new FormControl('Drew'),
  });

  formDisplay(): void {
    console.log("prova",this.group.getRawValue());
  }
}
