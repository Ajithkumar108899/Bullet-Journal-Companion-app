import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractDataView } from './extract-data-view';

describe('ExtractDataView', () => {
  let component: ExtractDataView;
  let fixture: ComponentFixture<ExtractDataView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractDataView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractDataView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
