import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentViewPage } from './current-view.page';

describe('Tab1Page', () => {
  let component: CurrentViewPage;
  let fixture: ComponentFixture<CurrentViewPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentViewPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
