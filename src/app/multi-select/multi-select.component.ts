import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  HostListener,
  Input,
  QueryList,
  Signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
  contentChildren,
  forwardRef,
  signal,
  viewChild,
} from '@angular/core';
import { OptionDirective } from './option.directive';
import { style } from '@angular/animations';

@Component({
  selector: 'multi-select',
  standalone: true,
  imports: [],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  @ContentChildren(OptionDirective, { read: ElementRef<HTMLElement> })
  children!: QueryList<ElementRef<HTMLElement>>;
  options: WritableSignal<HTMLOptionElement[]> = signal([]);
  selectedOptions: WritableSignal<unknown[]> = signal<unknown[]>([]);

  constructor(private select: ElementRef<HTMLSelectElement>) {}

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

  onSelectOption($event: Event) {
    $event.stopPropagation();
    $event.preventDefault();
    console.log($event);
  }
}
