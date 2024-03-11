import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YieldsDetailsPage } from './yields-details.page';

describe('YieldsDetailsPage', () => {
  let component: YieldsDetailsPage;
  let fixture: ComponentFixture<YieldsDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(YieldsDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
