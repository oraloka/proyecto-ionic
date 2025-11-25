import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddGroupPage } from './add-group.page';

describe('AddGroupPage', () => {
  let component: AddGroupPage;
  let fixture: ComponentFixture<AddGroupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
