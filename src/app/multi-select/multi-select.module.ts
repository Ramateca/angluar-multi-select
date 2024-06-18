import { NgModule } from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { HTMLOptionElementWithAnyValueType } from './option.directive';
import { MultiSelectDiverctive } from './multi-select.directive';

@NgModule({
  imports: [
    MultiSelectComponent,
    HTMLOptionElementWithAnyValueType,
    MultiSelectDiverctive,
  ],
  exports: [
    MultiSelectComponent,
    HTMLOptionElementWithAnyValueType,
    MultiSelectDiverctive,
  ],
})
export class MultiSelectModule {}
