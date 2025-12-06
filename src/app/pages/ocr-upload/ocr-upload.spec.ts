import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrUpload } from './ocr-upload';

describe('OcrUpload', () => {
  let component: OcrUpload;
  let fixture: ComponentFixture<OcrUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcrUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OcrUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
