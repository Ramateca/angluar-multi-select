import {
  Component,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  AfterContentInit,
  HostBinding,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'option, label[option]',
  standalone: true,
  imports: [],
  template: '<ng-content />',
})
export class OptionDirective implements AfterContentInit {
  @Input() value?: unknown;
  @Input() ngValue?: unknown;
  @Input() disabled = false;
  @Input() label!: string;
  @Input() selected = false;

  @HostBinding('attr.selected')
  get isSelected(): '' | undefined {
    return this.selected ? '' : undefined;
  }

  @HostBinding('attr.disabled')
  get isDisabled(): '' | undefined {
    return this.disabled ? '' : undefined;
  }

  constructor(private el: ElementRef<HTMLOptionElement>) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      if (!this.label) this.label = '' + this.el.nativeElement.textContent;
    });
    if (!this.value && this.ngValue) this.value = this.ngValue;
  }

  toString(): string {
    return this.label || '';
  }
}
