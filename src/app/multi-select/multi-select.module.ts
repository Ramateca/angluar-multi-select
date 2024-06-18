import { NgModule } from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { OptionDirective } from './option.directive';
import { MultiSelectDiverctive } from './multi-select.directive';



@NgModule({
  imports: [
    MultiSelectComponent,
    OptionDirective,
    MultiSelectDiverctive
  ],
  exports: [
    MultiSelectComponent,
    OptionDirective,
    MultiSelectDiverctive
  ]
})
export class MultiSelectModule { }
