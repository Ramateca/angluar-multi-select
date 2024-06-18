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
  options: { label: string; value: any }[] = [
    { label: 'picone', value: 1 },
    { label: 'carlo', value: undefined },
    { label: 'giorgio', value: {id: 3, content: NaN,toString: this.tostring} },
    { label: 'luca', value: ()=>'picone' },
    { label: 'luigi', value: "piccione" },
    { label: 'giorgione', value: {id: 6, content: undefined,toString: this.tostring} },
    { label: 'ilario', value: {id: 7, content: ()=>'test',toString: this.tostring} },
  ];

  group = new FormGroup({
    first: new FormControl(),
    last: new FormControl('Drew'),
  });
  
  tostring(this: any) {
    return this.id;
  }

  formDisplay(): void {
    console.log("prova",this.group.getRawValue());
    this.options.pop();
    console.log(this.options)
  }
}
