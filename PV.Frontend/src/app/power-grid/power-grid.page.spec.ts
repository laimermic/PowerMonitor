import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerGridPage } from './power-grid.page';

describe('PowerGridPage', () => {
  let component: PowerGridPage;
  let fixture: ComponentFixture<PowerGridPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerGridPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PowerGridPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
