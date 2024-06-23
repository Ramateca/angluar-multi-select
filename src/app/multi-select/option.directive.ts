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
export class Option implements AfterContentInit {
  @Input() value?: unknown;
  @Input() ngValue?: unknown;

  @HostBinding('attr.disabled')
  private _disabled: '' | undefined = undefined;

  @Input()
  public set disabled(value: unknown) {
    if (value !== undefined && value !== null) {
      if (value === false) this._disabled = undefined;
      else this._disabled = '';
    } else this._disabled = undefined;
  }

  get disabled(): boolean {
    return this._disabled !== undefined;
  }

  @Input() label!: string;

  @HostBinding('attr.selected')
  private _selected: '' | undefined = undefined;

  @Input()
  public set selected(value: unknown) {
    if (value !== undefined && value !== null) {
      if (value === false) this._selected = undefined;
      else this._selected = '';
    } else this._selected = undefined;
  }

  get selected(): boolean {
    return this._selected !== undefined;
  }

  constructor(private el: ElementRef<HTMLOptionElement>) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      if (!this.label) this.label = '' + this.el.nativeElement.textContent;
    });
    if (!this.value && this.ngValue) this.value = this.ngValue;
  }

  toString(): string {
    return this.label ?? '';
  }
}
