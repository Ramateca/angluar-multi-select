import { NgModule } from '@angular/core';
import { MultiSelectComponent } from './multi-select.component';
import { OptionDirective } from './option.directive';
import { MultiSelectDiverctive } from './multi-select.directive';

@NgModule({
  imports: [
    MultiSelectComponent,
    MultiSelectDiverctive,
    OptionDirective,
  ],
  exports: [
    MultiSelectComponent,
    MultiSelectDiverctive,
    OptionDirective,
  ],
})
export class MultiSelectModule {}
