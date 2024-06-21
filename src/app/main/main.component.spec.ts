import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestWiewComponent } from './test-wiew.component';

describe('TestWiewComponent', () => {
  let component: TestWiewComponent;
  let fixture: ComponentFixture<TestWiewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWiewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestWiewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
