import { NgModule } from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { Option } from './option.directive';
import { MultiSelectDiverctive } from './multi-select.directive';

@NgModule({
  imports: [
    MultiSelectComponent,
    MultiSelectDiverctive,
    Option,
  ],
  exports: [
    MultiSelectComponent,
    MultiSelectDiverctive,
    Option,
  ],
})
export class MultiSelectModule {}
