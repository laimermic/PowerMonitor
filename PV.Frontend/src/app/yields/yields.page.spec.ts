import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YieldsPage } from './yields.page';

describe('YieldsPage', () => {
  let component: YieldsPage;
  let fixture: ComponentFixture<YieldsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(YieldsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
